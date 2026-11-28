alter table public.equipment
  add column if not exists contact text
    check (
      contact is null
      or (kind in ('sale', 'loan') and length(trim(contact)) between 1 and 120)
    );
