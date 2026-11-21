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
  ('packs', 'guide', null, 'packs', 'حقيبة ظهر للمشي', 'حقيبة بحزام خصر لتوزيع الوزن وجيوب يسهل الوصول إليها.', 'ضع الأغراض الثقيلة قرب ظهرك واضبط حزام الخصر قبل شد أحزمة الكتفين.', 'جرّب الحقيبة بوزن قريب من حمولة رحلتك واختر سعة تناسب المدة.'),
  ('boots', 'guide', null, 'boots', 'حذاء للمسارات', 'حذاء بنعل متماسك يحمي القدم على الأسطح الوعرة.', 'جرّبه في مشاوير قصيرة قبل الرحلة واربطه بحيث يثبت الكعب.', 'جرّبه بجوارب الرحلة واترك مساحة لحركة الأصابع عند النزول.'),
  ('tents', 'guide', null, 'tents', 'خيمة تخييم', 'مأوى خفيف للمبيت في الهواء الطلق.', 'اختر سطحًا مستويًا وموقعًا مسموحًا، ثم ثبّت الأوتاد وافتح منافذ التهوية.', 'وازن بين السعة والوزن ومقاومة المطر والرياح المتوقعة.'),
  ('sleeping', 'guide', null, 'sleeping', 'كيس نوم', 'طبقة عازلة تساعد على الاحتفاظ بحرارة الجسم أثناء النوم.', 'افرده قبل النوم واستخدم تحته فرشة عازلة. خزّنه جافًا ومفكوك الضغط.', 'اختر درجة الراحة بناءً على أقل حرارة ليلية متوقعة.'),
  ('cooking', 'guide', null, 'cooking', 'عدة طبخ للتخييم', 'قدر خفيف وموقد محمول لإعداد وجبات بسيطة.', 'شغّل الموقد خارج الخيمة على سطح ثابت واتبع تعليمات الصانع.', 'تحقق من توفر الوقود المناسب واختر سعة القدر حسب حجم المجموعة.'),
  ('lighting', 'guide', null, 'lighting', 'مصباح تخييم', 'إضاءة محمولة للتنقل والعمل بعد حلول الظلام.', 'اشحنه قبل الرحلة واستخدم مستوى الإضاءة المناسب لتوفير الطاقة.', 'قارن مدة التشغيل ومقاومة الماء، واختر مصباح رأس عند الحاجة إلى يدين حرتين.'),
  ('clothes', 'guide', null, 'clothes', 'سترة للمسارات', 'طبقة خارجية تحمي من الرياح وتساعد على التكيف مع الطقس.', 'ارتدها فوق طبقة أساسية وأضف طبقة دافئة عند انخفاض الحرارة.', 'اختر تهوية جيدة ومساحة كافية للطبقات وفق طقس الرحلة.'),
  ('safety', 'guide', null, 'safety', 'حقيبة إسعافات أولية', 'مستلزمات أساسية للعناية بالإصابات البسيطة أثناء الرحلة.', 'احفظها في جيب يسهل الوصول إليه وراجع المحتويات وتواريخ الصلاحية.', 'اختر محتويات تناسب عدد الأشخاص وطول الرحلة ومدى بُعدها عن الخدمات.');

insert into public.packing_templates (id, trip_type, terrain, min_days, items) values
  ('essentials', null, null, 1, array['ماء للشرب', 'وجبات خفيفة', 'حقيبة إسعافات أولية', 'هاتف مشحون']),
  ('hiking', 'hiking', null, 1, array['حذاء للمسارات', 'خريطة تعمل دون اتصال', 'حقيبة ظهر']),
  ('camping', 'camping', null, 1, array['خيمة', 'كيس نوم', 'فرشة عازلة', 'مصباح', 'عدة طبخ']),
  ('picnic', 'picnic', null, 1, array['بساط جلوس', 'علبة طعام', 'كيس للنفايات']),
  ('overnight', null, null, 2, array['ملابس إضافية', 'بطارية متنقلة', 'فرشة عازلة', 'مصباح']),
  ('extended', null, null, 3, array['وجبات إضافية', 'مستلزمات النظافة', 'مصدر احتياطي للطاقة']),
  ('mountain', null, 'mountain', 1, array['سترة واقية من الرياح', 'عصي مشي']),
  ('desert', null, 'desert', 1, array['ماء إضافي', 'قبعة شمس', 'واقي الشمس']),
  ('forest', null, 'forest', 1, array['طارد حشرات', 'سترة مطر']),
  ('coast', null, 'coast', 1, array['واقي الشمس', 'حافظة مقاومة للماء']);
