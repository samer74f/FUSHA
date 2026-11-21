-- Draft for a project without Trips tables. Run inspect.sql first and review with the team.
begin;

-- Capture the display name from the signed-in user's metadata, without reading profiles.
create function public.trip_account_display_name()
returns text
language sql
stable
set search_path = ''
as $$
  select left(coalesce(
    nullif(btrim(auth.jwt() -> 'user_metadata' ->> 'display_name'), ''),
    nullif(btrim(auth.jwt() -> 'user_metadata' ->> 'full_name'), ''),
    nullif(btrim(auth.jwt() -> 'user_metadata' ->> 'name'), '')
  ), 80);
$$;

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 120),
  location text not null check (char_length(btrim(location)) between 1 and 160),
  date date not null check (date between date '0001-01-01' and date '9999-12-31'),
  trip_type text not null check (trip_type in ('Individual', 'Family', 'Group')),
  max_participants integer not null,
  description text not null default '' check (char_length(description) <= 2000),
  organizer_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  organizer_name text default public.trip_account_display_name(),
  current_participants integer not null default 1,
  created_at timestamptz not null default now(),
  constraint trips_capacity check (current_participants between 1 and max_participants),
  constraint trips_members_require_group check (trip_type = 'Group' or current_participants = 1)
);

create table public.trip_participants (
  trip_id uuid references public.trips(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  participant_name text default public.trip_account_display_name(),
  joined_at timestamptz not null default now(),
  primary key (trip_id, user_id)
);

create index trips_date_id_idx on public.trips (date, id);
create index trips_organizer_id_idx on public.trips (organizer_id);
create index trip_participants_user_id_idx on public.trip_participants (user_id);

alter table public.trips enable row level security;
alter table public.trip_participants enable row level security;

revoke all on public.trips, public.trip_participants from public, anon, authenticated;
grant select on public.trips to anon, authenticated;
grant insert (title, location, date, trip_type, max_participants, description),
      update (title, location, date, trip_type, max_participants, description),
      delete on public.trips to authenticated;
grant select on public.trip_participants to authenticated;

create policy "Anyone can read trips" on public.trips
  for select to anon, authenticated using (true);

create policy "Users can create their own trips" on public.trips
  for insert to authenticated with check (organizer_id = (select auth.uid()));

create policy "Organizers can edit their own trips" on public.trips
  for update to authenticated
  using (organizer_id = (select auth.uid()))
  with check (organizer_id = (select auth.uid()));

create policy "Organizers can delete their own trips" on public.trips
  for delete to authenticated using (organizer_id = (select auth.uid()));

create policy "Members see themselves and organizers see their roster"
  on public.trip_participants for select to authenticated using (
    user_id = (select auth.uid()) or exists (
      select 1 from public.trips
      where trips.id = trip_participants.trip_id and trips.organizer_id = (select auth.uid())
    )
  );

create function public.join_trip(p_trip_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  selected_trip public.trips%rowtype;
begin
  if caller_id is null then
    raise exception using errcode = '42501', message = 'trip_sign_in_required';
  end if;

  -- Keep membership and capacity changes for the same trip in order.
  select * into selected_trip from public.trips where id = p_trip_id for update;
  if not found then raise exception 'trip_not_found'; end if;

  if caller_id = selected_trip.organizer_id or exists (
    select 1 from public.trip_participants where trip_id = p_trip_id and user_id = caller_id
  ) then
    raise exception 'trip_already_joined';
  end if;

  if selected_trip.trip_type <> 'Group'
    or selected_trip.date < (statement_timestamp() at time zone 'Asia/Hebron')::date then
    raise exception 'trip_closed';
  end if;

  if selected_trip.current_participants >= selected_trip.max_participants then
    raise exception 'trip_full';
  end if;

  insert into public.trip_participants (trip_id, user_id) values (p_trip_id, caller_id);
  update public.trips set current_participants = current_participants + 1 where id = p_trip_id;
end;
$$;

create function public.remove_trip_participant(p_trip_id uuid, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  trip_owner uuid;
begin
  if caller_id is null or p_user_id is null then
    raise exception using errcode = '42501', message = 'trip_sign_in_required';
  end if;

  select organizer_id into trip_owner from public.trips where id = p_trip_id for update;
  if not found then raise exception 'trip_not_found'; end if;

  if caller_id <> p_user_id and caller_id <> trip_owner then
    raise exception using errcode = '42501', message = 'trip_remove_not_allowed';
  end if;

  delete from public.trip_participants where trip_id = p_trip_id and user_id = p_user_id;
end;
$$;

-- Also keep the counter correct if Auth deletes a user and cascades their memberships.
create function public.decrease_trip_participants()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.trips set current_participants = current_participants - 1 where id = old.trip_id;
  return old;
end;
$$;

create trigger trip_participant_deleted
after delete on public.trip_participants
for each row execute function public.decrease_trip_participants();

revoke execute on function public.trip_account_display_name(), public.join_trip(uuid),
  public.remove_trip_participant(uuid, uuid), public.decrease_trip_participants()
  from public, anon, authenticated;
grant execute on function public.trip_account_display_name(), public.join_trip(uuid),
  public.remove_trip_participant(uuid, uuid) to authenticated;

commit;
