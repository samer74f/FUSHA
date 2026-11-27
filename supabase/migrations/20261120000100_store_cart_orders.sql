-- FUSHA store schema. The existing profiles table is reused and is not recreated.
-- Store operations are guarded by RLS; order creation runs in one transaction.

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  description text not null default '',
  price numeric(10, 2) not null check (price >= 0),
  category text not null default '',
  image_url text,
  stock integer not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipient_name text not null check (length(trim(recipient_name)) >= 2),
  phone text not null check (length(trim(phone)) >= 7),
  delivery_address text not null check (length(trim(delivery_address)) >= 5),
  total numeric(10, 2) not null default 0 check (total >= 0),
  status text not null default 'Pending'
    check (status in ('Pending', 'Processing', 'Completed', 'Cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0)
);

create index if not exists cart_items_user_id_idx on public.cart_items(user_id);
create index if not exists orders_user_id_created_at_idx on public.orders(user_id, created_at desc);
create index if not exists order_items_order_id_idx on public.order_items(order_id);

create or replace function public.is_store_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select
    coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
    or coalesce((auth.jwt() -> 'app_metadata' -> 'roles') ? 'admin', false);
$$;

create or replace function public.place_order(
  p_recipient_name text,
  p_phone text,
  p_delivery_address text,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_order_id uuid;
  v_item jsonb;
  v_product public.products%rowtype;
  v_product_id uuid;
  v_quantity integer;
  v_total numeric(10, 2) := 0;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if length(trim(coalesce(p_recipient_name, ''))) < 2
    or length(trim(coalesce(p_phone, ''))) < 7
    or length(trim(coalesce(p_delivery_address, ''))) < 5 then
    raise exception 'Recipient and delivery details are required';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'Order must contain at least one item';
  end if;

  if jsonb_array_length(p_items) = 0 then
    raise exception 'Order must contain at least one item';
  end if;

  insert into public.orders (user_id, recipient_name, phone, delivery_address)
  values (v_user_id, trim(p_recipient_name), trim(p_phone), trim(p_delivery_address))
  returning id into v_order_id;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item ->> 'product_id')::uuid;
    v_quantity := (v_item ->> 'quantity')::integer;

    if v_quantity < 1 then
      raise exception 'Quantity must be positive';
    end if;

    select * into v_product
    from public.products
    where id = v_product_id and is_active = true
    for update;

    if not found then
      raise exception 'A selected product is unavailable';
    end if;

    if v_product.stock < v_quantity then
      raise exception 'Insufficient stock for product %', v_product.name;
    end if;

    update public.products
    set stock = stock - v_quantity
    where id = v_product.id;

    insert into public.order_items (order_id, product_id, product_name, unit_price, quantity)
    values (v_order_id, v_product.id, v_product.name, v_product.price, v_quantity);

    v_total := v_total + v_product.price * v_quantity;
  end loop;

  update public.orders set total = v_total where id = v_order_id;
  delete from public.cart_items where user_id = v_user_id;

  return v_order_id;
end;
$$;

revoke all on function public.place_order(text, text, text, jsonb) from public;
grant execute on function public.place_order(text, text, text, jsonb) to authenticated;

alter table public.products enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant select, insert, update, delete on public.cart_items to authenticated;
grant select, update on public.orders to authenticated;
grant select on public.order_items to authenticated;

drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products
  for select to anon, authenticated
  using (is_active or public.is_store_admin());

drop policy if exists products_admin_manage on public.products;
create policy products_admin_manage on public.products
  for all to authenticated
  using (public.is_store_admin())
  with check (public.is_store_admin());

drop policy if exists cart_items_owner_manage on public.cart_items;
create policy cart_items_owner_manage on public.cart_items
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists orders_owner_or_admin_read on public.orders;
create policy orders_owner_or_admin_read on public.orders
  for select to authenticated
  using (user_id = (select auth.uid()) or public.is_store_admin());

drop policy if exists orders_owner_create on public.orders;
create policy orders_owner_create on public.orders
  for insert to authenticated
  with check (user_id = (select auth.uid()) and status = 'Pending');

drop policy if exists orders_admin_update on public.orders;
create policy orders_admin_update on public.orders
  for update to authenticated
  using (public.is_store_admin())
  with check (public.is_store_admin());

drop policy if exists order_items_owner_or_admin_read on public.order_items;
create policy order_items_owner_or_admin_read on public.order_items
  for select to authenticated
  using (
    public.is_store_admin()
    or exists (
      select 1 from public.orders
      where orders.id = order_items.order_id and orders.user_id = (select auth.uid())
    )
  );

drop policy if exists order_items_admin_insert on public.order_items;
create policy order_items_admin_insert on public.order_items
  for insert to authenticated
  with check (public.is_store_admin());

-- The existing profiles table is scoped to its owner. These restrictive guards
-- prevent any pre-existing permissive policy from exposing another user's row.
alter table public.profiles enable row level security;

drop policy if exists profiles_self_select_fusha on public.profiles;
create policy profiles_self_select_fusha on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists profiles_self_update_fusha on public.profiles;
create policy profiles_self_update_fusha on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists profiles_self_insert_fusha on public.profiles;
create policy profiles_self_insert_fusha on public.profiles
  for insert to authenticated
  with check (id = (select auth.uid()));

drop policy if exists profiles_select_guard_fusha on public.profiles;
create policy profiles_select_guard_fusha on public.profiles
  as restrictive for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists profiles_update_guard_fusha on public.profiles;
create policy profiles_update_guard_fusha on public.profiles
  as restrictive for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists profiles_insert_guard_fusha on public.profiles;
create policy profiles_insert_guard_fusha on public.profiles
  as restrictive for insert to authenticated
  with check (id = (select auth.uid()));

drop policy if exists profiles_delete_guard_fusha on public.profiles;
create policy profiles_delete_guard_fusha on public.profiles
  as restrictive for delete to authenticated
  using (false);

drop policy if exists profiles_anon_guard_fusha on public.profiles;
create policy profiles_anon_guard_fusha on public.profiles
  as restrictive for all to anon
  using (false)
  with check (false);

create or replace function public.create_fusha_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.create_fusha_profile_for_new_user() from public;
drop trigger if exists create_fusha_profile_after_signup on auth.users;
create trigger create_fusha_profile_after_signup
  after insert on auth.users
  for each row execute function public.create_fusha_profile_for_new_user();

notify pgrst, 'reload schema';
