create table public.equipment (
  id text primary key default gen_random_uuid()::text,
  kind text not null check (kind in ('guide', 'sale', 'loan')),
  owner_id uuid default auth.uid() references auth.users(id) on delete cascade,
  category text not null check (category in ('packs','boots','tents','sleeping','cooking','lighting','clothes','safety')),
  name text not null check (length(trim(name)) between 1 and 100),
  description text not null check (length(trim(description)) between 1 and 2000),
  image_url text check (image_url ~ '^https?://[^[:space:]]+$'),
  usage text,
  selection_tips text,
  condition text check (condition in ('excellent', 'good', 'fair')),
  price numeric(10,2),
  currency text check (currency ~ '^[A-Z]{3}$'),
  loan_terms text check (length(trim(loan_terms)) between 1 and 1000),
  created_at timestamptz not null default now(),
  check (
    (kind = 'guide' and owner_id is null and usage is not null and selection_tips is not null)
    or (kind in ('sale','loan') and owner_id is not null and image_url is not null and condition is not null
      and ((kind = 'sale' and price is not null and price > 0 and price < 100000000 and currency is not null and loan_terms is null)
        or (kind = 'loan' and loan_terms is not null and price is null and currency is null)))
  )
);
create index equipment_owner_idx on public.equipment(owner_id);

create table public.packing_templates (
  id text primary key,
  trip_type text check (trip_type in ('hiking', 'camping', 'picnic')),
  terrain text check (terrain in ('mountain', 'desert', 'forest', 'coast')),
  min_days integer not null default 1 check (min_days >= 1),
  items text[] not null check (cardinality(items) > 0)
);

create table public.packing_items (
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  trip_type text not null check (trip_type in ('hiking', 'camping', 'picnic')),
  terrain text not null check (terrain in ('mountain', 'desert', 'forest', 'coast')),
  days integer not null check (days between 1 and 365),
  name text not null check (length(trim(name)) between 1 and 120),
  packed boolean not null default false,
  removed boolean not null default false,
  primary key (owner_id, trip_type, terrain, days, name)
);

alter table public.equipment enable row level security;
alter table public.packing_templates enable row level security;
alter table public.packing_items enable row level security;

revoke all on public.equipment, public.packing_templates, public.packing_items from anon, authenticated;
grant select on public.equipment, public.packing_templates to anon, authenticated;
grant insert, update, delete on public.equipment to authenticated;
grant select, insert, update, delete on public.packing_items to authenticated;

create policy "Anyone can read equipment" on public.equipment for select to anon, authenticated using (true);
create policy "Owners can post listings" on public.equipment for insert to authenticated
  with check (kind in ('sale','loan') and owner_id = (select auth.uid()));
create policy "Owners can edit listings" on public.equipment for update to authenticated
  using (kind in ('sale','loan') and owner_id = (select auth.uid()))
  with check (kind in ('sale','loan') and owner_id = (select auth.uid()));
create policy "Owners can delete listings" on public.equipment for delete to authenticated
  using (kind in ('sale','loan') and owner_id = (select auth.uid()));

create policy "Anyone can read packing templates" on public.packing_templates for select to anon, authenticated using (true);
create policy "Owners manage their packing items" on public.packing_items for all to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

insert into public.equipment (id, kind, owner_id, category, name, description, usage, selection_tips) values
  ('packs', 'guide', null, 'packs', 'Hiking backpack', 'A backpack with a hip belt to distribute weight and easy-access pockets.', 'Pack heavy items close to your back and adjust the hip belt before tightening the shoulder straps.', 'Try the pack with a realistic load and choose a capacity that suits the length of your trip.'),
  ('boots', 'guide', null, 'boots', 'Hiking boots', 'Footwear with grippy soles for uneven trails.', 'Wear them on short walks before your trip and lace them to hold your heel securely.', 'Try them with your hiking socks and leave room for your toes on descents.'),
  ('tents', 'guide', null, 'tents', 'Camping tent', 'A lightweight shelter for overnight trips.', 'Choose a level, permitted campsite, secure the stakes, and open the vents.', 'Balance space, weight, and protection from rain and wind.'),
  ('sleeping', 'guide', null, 'sleeping', 'Sleeping bag', 'An insulated layer that keeps you warm overnight.', 'Unroll it before bed, use a sleeping pad underneath, and store it dry and uncompressed.', 'Choose a comfort rating for the lowest temperature you expect at night.'),
  ('cooking', 'guide', null, 'cooking', 'Camping cookware', 'A lightweight pot and portable stove for simple meals.', 'Use the stove outside the tent on a stable surface and follow the manufacturer instructions.', 'Check that compatible fuel is available and choose a pot large enough for your group.'),
  ('lighting', 'guide', null, 'lighting', 'Camping light', 'Portable lighting for moving around and working after dark.', 'Charge it before the trip and use a brightness setting that saves power.', 'Compare runtime and water resistance. Choose a headlamp when you need both hands free.'),
  ('clothes', 'guide', null, 'clothes', 'Trail jacket', 'An outer layer that blocks wind and helps you adapt to changing weather.', 'Wear it over a base layer and add insulation when temperatures drop.', 'Look for a breathable jacket with enough room for layers.'),
  ('safety', 'guide', null, 'safety', 'First aid kit', 'Basic supplies for treating minor injuries outdoors.', 'Keep it in an easy-access pocket and check the supplies and expiration dates.', 'Pack for the group size, trip length, and distance from assistance.');

insert into public.packing_templates (id, trip_type, terrain, min_days, items) values
  ('essentials', null, null, 1, array['Drinking water', 'Snacks', 'First aid kit', 'Charged phone']),
  ('hiking', 'hiking', null, 1, array['Hiking boots', 'Offline map', 'Backpack']),
  ('camping', 'camping', null, 1, array['Tent', 'Sleeping bag', 'Sleeping pad', 'Light', 'Cooking kit']),
  ('picnic', 'picnic', null, 1, array['Picnic blanket', 'Food container', 'Trash bags']),
  ('overnight', null, null, 2, array['Extra clothes', 'Power bank', 'Sleeping pad', 'Light']),
  ('extended', null, null, 3, array['Extra snacks', 'Toiletries', 'Backup power source']),
  ('mountain', null, 'mountain', 1, array['Windproof jacket', 'Trekking poles']),
  ('desert', null, 'desert', 1, array['Extra water', 'Sun hat', 'Sunscreen']),
  ('forest', null, 'forest', 1, array['Insect repellent', 'Rain jacket']),
  ('coast', null, 'coast', 1, array['Sunscreen', 'Waterproof pouch']);
