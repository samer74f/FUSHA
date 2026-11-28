begin;

alter table public.orders
  add column if not exists checkout_request_id uuid,
  add column if not exists checkout_request_hash bytea;

create unique index if not exists orders_checkout_request_idx
  on public.orders (user_id, checkout_request_id);

create or replace function public.place_order(
  p_recipient_name text,
  p_phone text,
  p_delivery_address text,
  p_items jsonb,
  p_request_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_recipient_name text := trim(p_recipient_name);
  v_phone text := trim(p_phone);
  v_delivery_address text := trim(p_delivery_address);
  v_request_hash bytea;
  v_saved_hash bytea;
  v_items jsonb;
  v_item record;
  v_product public.products%rowtype;
  v_order_id uuid;
  v_total numeric(10, 2) := 0;
begin
  if v_user_id is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;

  if p_request_id is null
    or coalesce(length(v_recipient_name), 0) < 2
    or v_phone is null
    or v_phone !~ '^[+0-9[:space:]()-]{7,20}$'
    or coalesce(length(v_delivery_address), 0) < 5 then
    raise exception 'Order request and delivery details are required';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'Order must contain at least one item';
  end if;

  if jsonb_array_length(p_items) = 0 then
    raise exception 'Order must contain at least one item';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_items) as item(product_id uuid, quantity integer, unit_price numeric)
    where item.product_id is null or item.quantity is null or item.quantity < 1
      or item.unit_price is null or item.unit_price not between 0 and 99999999.99
      or item.unit_price <> round(item.unit_price, 2)
  ) then
    raise exception 'Each order item needs a product, quantity, and quoted price';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_items) as item(product_id uuid)
    group by item.product_id
    having count(*) > 1
  ) then
    raise exception 'Each product may appear only once per order';
  end if;

  select jsonb_agg(
    jsonb_build_object(
      'product_id', item.product_id,
      'quantity', item.quantity,
      'unit_price', round(item.unit_price, 2)
    ) order by item.product_id
  )
  into v_items
  from jsonb_to_recordset(p_items) as item(product_id uuid, quantity integer, unit_price numeric);

  v_request_hash := sha256(convert_to(jsonb_build_array(
    v_recipient_name, v_phone, v_delivery_address, v_items
  )::text, 'UTF8'));

  -- A retry waits on the same user's unique request ID before touching stock.
  insert into public.orders (
    user_id, recipient_name, phone, delivery_address, checkout_request_id, checkout_request_hash
  )
  values (v_user_id, v_recipient_name, v_phone, v_delivery_address, p_request_id, v_request_hash)
  on conflict (user_id, checkout_request_id) do nothing
  returning id into v_order_id;

  if v_order_id is null then
    select orders.id, orders.checkout_request_hash
    into v_order_id, v_saved_hash
    from public.orders
    where orders.user_id = v_user_id and orders.checkout_request_id = p_request_id;

    if v_saved_hash is distinct from v_request_hash then
      raise exception 'FUSHA_REQUEST_ALREADY_USED';
    end if;

    return v_order_id;
  end if;

  -- The same product order avoids deadlocks when baskets share stock.
  for v_item in
    select *
    from jsonb_to_recordset(v_items) as item(product_id uuid, quantity integer, unit_price numeric)
    order by item.product_id
  loop
    select * into v_product
    from public.products
    where id = v_item.product_id and is_active = true
    for update;

    if not found then
      raise exception 'FUSHA_PRODUCT_UNAVAILABLE';
    end if;

    if v_product.stock < v_item.quantity then
      raise exception 'FUSHA_STOCK_CHANGED';
    end if;

    if v_product.price <> v_item.unit_price then
      raise exception 'FUSHA_PRICE_CHANGED';
    end if;

    update public.products
    set stock = stock - v_item.quantity
    where id = v_product.id;

    insert into public.order_items (order_id, product_id, product_name, unit_price, quantity)
    values (v_order_id, v_product.id, v_product.name, v_product.price, v_item.quantity);

    v_total := v_total + v_product.price * v_item.quantity;

    -- Keep items or quantities added in another tab during checkout.
    delete from public.cart_items
    where user_id = v_user_id and product_id = v_product.id and quantity = v_item.quantity;
  end loop;

  update public.orders set total = v_total where id = v_order_id;
  return v_order_id;
end;
$$;

-- Older storefronts get a refresh error instead of placing an unprotected order.
create or replace function public.place_order(
  p_recipient_name text,
  p_phone text,
  p_delivery_address text,
  p_items jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception 'FUSHA_CHECKOUT_REFRESH_REQUIRED';
end;
$$;

revoke all on function public.place_order(text, text, text, jsonb, uuid) from public, anon;
grant execute on function public.place_order(text, text, text, jsonb, uuid) to authenticated;
revoke all on function public.place_order(text, text, text, jsonb) from public, anon;
grant execute on function public.place_order(text, text, text, jsonb) to authenticated;

-- The RPC is the checkout entry point for signed-in customers.
revoke insert on public.orders from anon, authenticated;

notify pgrst, 'reload schema';

commit;
