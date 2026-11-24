-- Bootstrap Trips in a disposable Supabase database with Auth and profiles(id).
-- For the team's existing database use inspect.sql and review prepare_existing.sql.
begin;

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references public.profiles(id),
  title text not null,
  description text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  meeting_point text,
  capacity integer not null check (capacity > 0),
  status text not null default 'draft' check (status in ('draft', 'open', 'full', 'cancelled', 'completed')),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table public.trip_participants (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  profile_id uuid not null references public.profiles(id),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  created_at timestamptz not null default now(),
  unique (trip_id, profile_id)
);

create index trips_starts_at_id_idx on public.trips (starts_at, id);
create index trip_participants_trip_status_idx on public.trip_participants (trip_id, status);

alter table public.trips enable row level security;
alter table public.trip_participants enable row level security;

revoke all on public.trips, public.trip_participants from public, anon, authenticated;
grant select on public.trips to anon, authenticated;
grant select on public.trip_participants to authenticated;
grant insert, update, delete on public.trips to authenticated;
grant insert (trip_id, profile_id, status), update (status), delete
  on public.trip_participants to authenticated;

create policy "Visible trips" on public.trips
  for select to anon, authenticated
  using (status <> 'draft' or organizer_id = (select auth.uid()));

create policy "Organizers create their trips" on public.trips
  for insert to authenticated with check (organizer_id = (select auth.uid()));

create policy "Organizers edit their trips" on public.trips
  for update to authenticated
  using (organizer_id = (select auth.uid()))
  with check (organizer_id = (select auth.uid()));

create policy "Organizers delete their trips" on public.trips
  for delete to authenticated using (organizer_id = (select auth.uid()));

create policy "Members and organizers read requests" on public.trip_participants
  for select to authenticated using (
    profile_id = (select auth.uid()) or exists (
      select 1 from public.trips
      where trips.id = trip_participants.trip_id and trips.organizer_id = (select auth.uid())
    )
  );

create policy "Members request open trips" on public.trip_participants
  for insert to authenticated with check (
    profile_id = (select auth.uid()) and status = 'pending' and exists (
      select 1 from public.trips
      where trips.id = trip_participants.trip_id and trips.status = 'open'
        and trips.organizer_id <> (select auth.uid())
    )
  );

create policy "Organizers decide requests" on public.trip_participants
  for update to authenticated
  using (status = 'pending' and exists (
    select 1 from public.trips
    where trips.id = trip_participants.trip_id and trips.organizer_id = (select auth.uid())
  ))
  with check (status in ('approved', 'rejected') and exists (
    select 1 from public.trips
    where trips.id = trip_participants.trip_id and trips.organizer_id = (select auth.uid())
  ));

create policy "Members and organizers remove requests or memberships" on public.trip_participants
  for delete to authenticated using (
    profile_id = (select auth.uid()) or exists (
      select 1 from public.trips
      where trips.id = trip_participants.trip_id and trips.organizer_id = (select auth.uid())
    )
  );

create function public.enforce_trip_capacity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  trip_capacity integer;
  approved_count integer;
begin
  if new.status <> 'approved' then
    return new;
  end if;

  -- Serialize approvals for this trip and hold the lock through the count and write.
  select capacity into trip_capacity from public.trips where id = new.trip_id for update;
  if not found then
    raise exception 'Trip does not exist';
  end if;

  select count(*) into approved_count from public.trip_participants
  where trip_id = new.trip_id and status = 'approved' and id <> new.id;
  if approved_count >= trip_capacity then
    raise exception 'Trip capacity has been reached';
  end if;

  return new;
end;
$$;

create function public.check_trip_capacity_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  approved_count integer;
begin
  if new.capacity < old.capacity then
    select count(*) into approved_count from public.trip_participants
    where trip_id = new.id and status = 'approved';
    if approved_count > new.capacity then
      raise exception 'Capacity cannot be lower than the approved participant count';
    end if;
  end if;
  return new;
end;
$$;

create trigger trip_capacity_approval before insert or update of status on public.trip_participants
  for each row execute function public.enforce_trip_capacity();

create trigger trip_capacity_change before update of capacity on public.trips
  for each row execute function public.check_trip_capacity_change();

revoke execute on function public.enforce_trip_capacity(), public.check_trip_capacity_change()
  from public, anon, authenticated;

commit;
