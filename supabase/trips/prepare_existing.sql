-- Review with the team before applying to the existing FUSHA schema.
begin;

alter table public.trips
  add column trip_type text
  constraint trips_trip_type_check
  check (trip_type in ('Individual', 'Family', 'Group'));

-- Legacy trips have no classified type and retain their existing request workflow.
create policy "New requests are for group or unclassified trips"
  on public.trip_participants as restrictive
  for insert to authenticated
  with check (
    exists (
      select 1
      from public.trips as trip
      where trip.id = trip_participants.trip_id
        and (trip.trip_type is null or trip.trip_type = 'Group')
    )
  );

-- Count approved seats for trips visible under the current trips SELECT policy.
-- Pending requests and the organizer do not occupy participant seats.
create function public.get_trip_approved_counts(p_trip_ids uuid[])
returns table (trip_id uuid, approved_count integer)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if pg_catalog.cardinality(p_trip_ids) > 100 then
    raise exception using errcode = '22023', message = 'Request at most 100 trip IDs';
  end if;

  return query
    select trip.id, count(participant.id)::integer
    from public.trips as trip
    left join public.trip_participants as participant
      on participant.trip_id = trip.id and participant.status = 'approved'
    where trip.id = any (p_trip_ids)
      and (trip.status <> 'draft' or trip.organizer_id = (select auth.uid()))
    group by trip.id;
end;
$$;

revoke all on function public.get_trip_approved_counts(uuid[])
  from public, anon, authenticated, service_role;
grant execute on function public.get_trip_approved_counts(uuid[])
  to anon, authenticated;

commit;
