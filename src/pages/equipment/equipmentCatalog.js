export const categories = {
  packs: 'Backpacks', boots: 'Footwear', tents: 'Tents', sleeping: 'Sleeping bags',
  cooking: 'Cooking gear', lighting: 'Lighting', clothes: 'Clothing', safety: 'Safety gear',
}

export const guide = [
  ['packs', 'Hiking backpack', 'A backpack with a hip belt to distribute weight and easy-access pockets.', 'Pack heavy items close to your back and adjust the hip belt before tightening the shoulder straps.', 'Try the pack with a realistic load and choose a capacity that suits the length of your trip.'],
  ['boots', 'Hiking boots', 'Footwear with grippy soles for uneven trails.', 'Wear them on short walks before your trip and lace them to hold your heel securely.', 'Try them with your hiking socks and leave room for your toes on descents.'],
  ['tents', 'Camping tent', 'A lightweight shelter for overnight trips.', 'Choose a level, permitted campsite, secure the stakes, and open the vents.', 'Balance space, weight, and protection from rain and wind.'],
  ['sleeping', 'Sleeping bag', 'An insulated layer that keeps you warm overnight.', 'Unroll it before bed, use a sleeping pad underneath, and store it dry and uncompressed.', 'Choose a comfort rating for the lowest temperature you expect at night.'],
  ['cooking', 'Camping cookware', 'A lightweight pot and portable stove for simple meals.', 'Use the stove outside the tent on a stable surface and follow the manufacturer instructions.', 'Check that compatible fuel is available and choose a pot large enough for your group.'],
  ['lighting', 'Camping light', 'Portable lighting for moving around and working after dark.', 'Charge it before the trip and use a brightness setting that saves power.', 'Compare runtime and water resistance. Choose a headlamp when you need both hands free.'],
  ['clothes', 'Trail jacket', 'An outer layer that blocks wind and helps you adapt to changing weather.', 'Wear it over a base layer and add insulation when temperatures drop.', 'Look for a breathable jacket with enough room for layers.'],
  ['safety', 'First aid kit', 'Basic supplies for treating minor injuries outdoors.', 'Keep it in an easy-access pocket and check the supplies and expiration dates.', 'Pack for the group size, trip length, and distance from assistance.'],
].map(([category, name, description, usage, selection_tips]) => ({
  id: category, category, name, description, usage, selection_tips, kind: 'guide',
}))

export const tripTypes = { hiking: 'Hiking', camping: 'Camping', picnic: 'Picnic' }
export const terrains = { mountain: 'Mountain', desert: 'Desert', forest: 'Forest', coast: 'Coast' }

export const templates = [
  { id: 'essentials', items: ['Drinking water', 'Snacks', 'First aid kit', 'Charged phone'] },
  { id: 'hiking', trip_type: 'hiking', items: ['Hiking boots', 'Offline map', 'Backpack'] },
  { id: 'camping', trip_type: 'camping', items: ['Tent', 'Sleeping bag', 'Sleeping pad', 'Light', 'Cooking kit'] },
  { id: 'picnic', trip_type: 'picnic', items: ['Picnic blanket', 'Food container', 'Trash bags'] },
  { id: 'overnight', min_days: 2, items: ['Extra clothes', 'Power bank', 'Sleeping pad', 'Light'] },
  { id: 'extended', min_days: 3, items: ['Extra snacks', 'Toiletries', 'Backup power source'] },
  { id: 'mountain', terrain: 'mountain', items: ['Windproof jacket', 'Trekking poles'] },
  { id: 'desert', terrain: 'desert', items: ['Extra water', 'Sun hat', 'Sunscreen'] },
  { id: 'forest', terrain: 'forest', items: ['Insect repellent', 'Rain jacket'] },
  { id: 'coast', terrain: 'coast', items: ['Sunscreen', 'Waterproof pouch'] },
]

const arabicCategories = {
  packs: 'الحقائب', boots: 'الأحذية', tents: 'الخيام', sleeping: 'أكياس النوم',
  cooking: 'أدوات الطبخ', lighting: 'الإضاءة', clothes: 'الملابس', safety: 'أدوات السلامة',
}

const arabicTripTypes = { hiking: 'مشي', camping: 'تخييم', picnic: 'نزهة' }
const arabicTerrains = { mountain: 'جبليّة', desert: 'صحراويّة', forest: 'حرجيّة', coast: 'ساحليّة' }

const arabicGuide = [
  ['packs', 'حقيبة ظهر للمشي', 'حقيبة بحزام خصر لتوزيع الوزن وجيوب يسهل الوصول إليها.', 'ضع الأغراض الثقيلة قرب ظهرك واضبط حزام الخصر قبل شد أحزمة الكتفين.', 'جرّب الحقيبة بوزن قريب من حمولة رحلتك واختر سعة تناسب المدة.'],
  ['boots', 'حذاء للمسارات', 'حذاء بنعل متماسك يحمي القدم على الأسطح الوعرة.', 'جرّبه في مشاوير قصيرة قبل الرحلة واربطه بحيث يثبت الكعب.', 'جرّبه بجوارب الرحلة واترك مساحة لحركة الأصابع عند النزول.'],
  ['tents', 'خيمة تخييم', 'مأوى خفيف للمبيت في الهواء الطلق.', 'اختر سطحًا مستويًا وموقعًا مسموحًا، ثم ثبّت الأوتاد وافتح منافذ التهوية.', 'وازن بين السعة والوزن ومقاومة المطر والرياح المتوقعة.'],
  ['sleeping', 'كيس نوم', 'طبقة عازلة تساعد على الاحتفاظ بحرارة الجسم أثناء النوم.', 'افرده قبل النوم واستخدم تحته فرشة عازلة. خزّنه جافًا ومفكوك الضغط.', 'اختر درجة الراحة بناءً على أقل حرارة ليلية متوقعة.'],
  ['cooking', 'عدة طبخ للتخييم', 'قدر خفيف وموقد محمول لإعداد وجبات بسيطة.', 'شغّل الموقد خارج الخيمة على سطح ثابت واتبع تعليمات الصانع.', 'تحقق من توفر الوقود المناسب واختر سعة القدر حسب حجم المجموعة.'],
  ['lighting', 'مصباح تخييم', 'إضاءة محمولة للتنقل والعمل بعد حلول الظلام.', 'اشحنه قبل الرحلة واستخدم مستوى الإضاءة المناسب لتوفير الطاقة.', 'قارن مدة التشغيل ومقاومة الماء، واختر مصباح رأس عند الحاجة إلى يدين حرتين.'],
  ['clothes', 'سترة للمسارات', 'طبقة خارجية تحمي من الرياح وتساعد على التكيف مع الطقس.', 'ارتدها فوق طبقة أساسية وأضف طبقة دافئة عند انخفاض الحرارة.', 'اختر تهوية جيدة ومساحة كافية للطبقات وفق طقس الرحلة.'],
  ['safety', 'حقيبة إسعافات أولية', 'مستلزمات أساسية للعناية بالإصابات البسيطة أثناء الرحلة.', 'احفظها في جيب يسهل الوصول إليه وراجع المحتويات وتواريخ الصلاحية.', 'اختر محتويات تناسب عدد الأشخاص وطول الرحلة ومدى بُعدها عن الخدمات.'],
].map(([category, name, description, usage, selection_tips]) => ({
  id: category, category, name, description, usage, selection_tips, kind: 'guide',
}))

const arabicTemplateItems = {
  essentials: ['ماء للشرب', 'وجبات خفيفة', 'حقيبة إسعافات أولية', 'هاتف مشحون'],
  hiking: ['حذاء للمسارات', 'خريطة تعمل دون اتصال', 'حقيبة ظهر'],
  camping: ['خيمة', 'كيس نوم', 'فرشة عازلة', 'مصباح', 'عدة طبخ'],
  picnic: ['بساط جلوس', 'علبة طعام', 'كيس للنفايات'],
  overnight: ['ملابس إضافية', 'بطارية متنقلة', 'فرشة عازلة', 'مصباح'],
  extended: ['وجبات إضافية', 'مستلزمات النظافة', 'مصدر احتياطي للطاقة'],
  mountain: ['سترة واقية من الرياح', 'عصي مشي'],
  desert: ['ماء إضافي', 'قبعة شمس', 'واقي الشمس'],
  forest: ['طارد حشرات', 'سترة مطر'],
  coast: ['واقي الشمس', 'حافظة مقاومة للماء'],
}

export function getEquipmentCategories(language) {
  return language === 'ar' ? arabicCategories : categories
}

export function getPackingOptions(language) {
  if (language === 'ar') return { tripTypes: arabicTripTypes, terrains: arabicTerrains }
  return { tripTypes, terrains }
}

function guideLabel(value, english, arabic, language) {
  if (value !== english && value !== arabic) return value
  return language === 'ar' ? arabic : english
}

export function localizeGuideRow(row, language) {
  const english = guide.find(item => item.id === row.id && item.category === row.category)
  const arabic = arabicGuide.find(item => item.id === row.id && item.category === row.category)
  if (!english || !arabic) return row

  return {
    ...row,
    name: guideLabel(row.name, english.name, arabic.name, language),
    description: guideLabel(row.description, english.description, arabic.description, language),
    usage: guideLabel(row.usage, english.usage, arabic.usage, language),
    selection_tips: guideLabel(row.selection_tips, english.selection_tips, arabic.selection_tips, language),
  }
}

export function localizeTemplateRow(row, language) {
  const builtIn = templates.find(template =>
    template.id === row.id
    && (template.trip_type ?? null) === (row.trip_type ?? null)
    && (template.terrain ?? null) === (row.terrain ?? null)
    && (template.min_days ?? 1) === (row.min_days ?? 1)
  )
  if (!builtIn) return row

  const arabicItems = arabicTemplateItems[row.id]

  // Keep the names used in saved checklists while translating the displayed labels.
  const itemLabels = row.items.map(name => {
    const englishIndex = builtIn.items.indexOf(name)
    const index = englishIndex === -1 ? arabicItems.indexOf(name) : englishIndex
    if (index === -1) return name
    return language === 'ar' ? arabicItems[index] : builtIn.items[index]
  })
  return { ...row, itemLabels }
}
