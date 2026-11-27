begin;

create table public.place_reviews (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  author_name text not null default left(coalesce(
    nullif(btrim(auth.jwt() -> 'user_metadata' ->> 'full_name'), ''),
    nullif(btrim(auth.jwt() -> 'user_metadata' ->> 'display_name'), ''),
    'FUSHA member'
  ), 80),
  rating smallint not null check (rating between 1 and 5),
  comment text not null check (char_length(btrim(comment, E' \t\n\r')) between 10 and 500),
  created_at timestamptz not null default now(),
  unique (place_id, user_id)
);

create index place_reviews_place_date_idx
  on public.place_reviews (place_id, created_at desc);

alter table public.place_reviews enable row level security;

revoke all on table public.place_reviews from public, anon, authenticated;
grant select (id, place_id, author_name, rating, comment, created_at) on public.place_reviews to anon;
grant select on public.place_reviews to authenticated;
grant insert (place_id, rating, comment), update (rating, comment), delete
  on public.place_reviews to authenticated;

create policy "Published places have public reviews"
  on public.place_reviews for select to anon, authenticated
  using (exists (
    select 1 from public.places
    where places.id = place_reviews.place_id and places.is_published
  ));

create policy "Members can add their own review"
  on public.place_reviews for insert to authenticated
  with check (user_id = (select auth.uid()) and exists (
    select 1 from public.places
    where places.id = place_reviews.place_id and places.is_published
  ));

create policy "Members can edit their own review"
  on public.place_reviews for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and exists (
    select 1 from public.places
    where places.id = place_reviews.place_id and places.is_published
  ));

create policy "Members can remove their own review"
  on public.place_reviews for delete to authenticated
  using (user_id = (select auth.uid()));

create view public.place_review_summary with (security_invoker = true) as
select place_id, round(avg(rating), 1) as rating, count(*) as review_count
from public.place_reviews
group by place_id;

revoke all on public.place_review_summary from public, anon, authenticated;
grant select on public.place_review_summary to anon, authenticated;

commit;
