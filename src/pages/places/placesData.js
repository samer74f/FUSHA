// بيانات تجريبية لأماكن طبيعية وتراثية داخل فلسطين/إسرائيل.
// تُستبدل هذه البيانات لاحقًا باستعلامات Supabase في placesService.
const photoByType = {
  desert: 'photo-1473580044384-7ba9967e16a0',
  sea: 'photo-1500375592092-40eb2168fd21',
  forest: 'photo-1448375240586-882707db888b',
  mountain: 'photo-1464822759023-fed622ff2c3b',
  valley: 'photo-1500530855697-b586d89ba3ee',
  heritage: 'photo-1519608487953-e999c86e7455',
}

const photos = (type) => {
  const image = photoByType[type] ?? photoByType.mountain
  return [1, 2, 3, 4].map(
    (number) => `https://images.unsplash.com/${image}?auto=format&fit=crop&w=1200&q=80&sig=${number}`,
  )
}

const rawPlaces = [
  {
    id: 'banias', name: 'محمية נחל חרמון (البانياس)', city: 'الجولان والجليل الأعلى', type: 'valley', entryFee: null, season: 'الربيع والصيف',
    lat: 33.2478, lng: 35.6947, facilities: ['hiking', 'parking', 'toilets'],
    description: 'محمية طبيعية في شمال البلاد، تشتهر بالشلالات والمياه الجارية والمسارات المحاطة بالنباتات.',
  },
  {
    id: 'ein-gedi', name: 'محمية عين جدي', city: 'البحر الميت', type: 'desert', entryFee: null, season: 'الخريف والشتاء والربيع',
    lat: 31.4656, lng: 35.3886, facilities: ['hiking', 'parking', 'toilets', 'food'],
    description: 'واحة صحراوية على شاطئ البحر الميت، تضم ينابيع وشلالات ومسارات للمشي بين المناظر الصحراوية.',
  },
  {
    id: 'caesarea', name: 'حديقة قيسارية الوطنية', city: 'الساحل الشمالي', type: 'heritage', entryFee: null, season: 'الربيع والخريف',
    lat: 32.4994, lng: 34.8917, facilities: ['guide', 'parking', 'food', 'toilets'],
    description: 'موقع أثري ساحلي يضم بقايا المدينة الرومانية والميناء القديم والمدرج المطل على البحر.',
  },
  {
    id: 'carmel', name: 'محمية جبل الكرمل', city: 'حيفا والكرمل', type: 'forest', entryFee: null, season: 'الخريف والشتاء والربيع',
    lat: 32.7333, lng: 35.0422, facilities: ['hiking', 'camping', 'parking', 'toilets'],
    description: 'منطقة طبيعية خضراء تضم غابات ومسارات مشي وإطلالات على الساحل والجبال.',
  },
  {
    id: 'masada', name: 'متسادا (قلعة مسعدة)', city: 'البحر الميت', type: 'mountain', entryFee: null, season: 'الخريف والشتاء والربيع',
    lat: 31.3156, lng: 35.3536, facilities: ['hiking', 'guide', 'parking', 'toilets'],
    description: 'موقع أثري فوق هضبة صخرية قرب البحر الميت، معروف بإطلالاته الواسعة وآثاره القديمة.',
  },
  {
    id: 'rosh-hanikra', name: 'رأس الناقورة', city: 'الجليل الغربي', type: 'sea', entryFee: null, season: 'الربيع والصيف',
    lat: 33.0866, lng: 35.1053, facilities: ['hiking', 'parking', 'food'],
    description: 'منحدرات ساحلية بيضاء وكهوف بحرية تشكلت بفعل الأمواج، مع مشاهد مميزة للبحر المتوسط.',
  },
  {
    id: 'agamon-hula', name: 'אגמון החולה (بحيرة الحولة)', city: 'الجليل الأعلى', type: 'valley', entryFee: null, season: 'الخريف والشتاء',
    lat: 33.1058, lng: 35.6036, facilities: ['hiking', 'parking', 'food', 'toilets'],
    description: 'موقع طبيعي لمشاهدة الطيور المهاجرة والحياة البرية، مع مسارات للمشي والدراجات.',
  },
  {
    id: 'ein-avdat', name: 'عين عفدات', city: 'النقب', type: 'desert', entryFee: null, season: 'الخريف والشتاء والربيع',
    lat: 30.8238, lng: 34.7732, facilities: ['hiking', 'parking', 'toilets'],
    description: 'وادي صحراوي عميق في النقب، يتميز بجروف صخرية وينابيع وشلالات موسمية ومسارات طبيعية.',
  },
]

export const places = rawPlaces.map((place) => ({ ...place, images: photos(place.type) }))
export const cities = [...new Set(places.map((place) => place.city))]
export const placeTypes = ['desert', 'sea', 'forest', 'mountain', 'valley', 'heritage']
export const typeIcons = { desert: '🏜️', sea: '🌊', forest: '🌲', mountain: '⛰️', valley: '🏞️', heritage: '🏛️' }

export const seedReviews = [
  { id: 'r1', placeId: 'banias', authorId: 'seed', author: 'ليلى', rating: 5, comment: 'المياه والشلالات جميلة جدًا، والمسار ممتع.', createdAt: '2026-10-02' },
  { id: 'r2', placeId: 'banias', authorId: 'seed', author: 'أحمد', rating: 4, comment: 'مكان رائع، يُفضّل الوصول في وقت مبكر.', createdAt: '2026-09-14' },
  { id: 'r3', placeId: 'ein-gedi', authorId: 'seed', author: 'سارة', rating: 5, comment: 'واحة جميلة وسط الصحراء، خذوا ماءً وحذاءً مناسبًا.', createdAt: '2026-08-21' },
  { id: 'r4', placeId: 'caesarea', authorId: 'seed', author: 'محمد', rating: 5, comment: 'الآثار والإطلالة البحرية تستحق الزيارة.', createdAt: '2026-04-11' },
  { id: 'r5', placeId: 'carmel', authorId: 'seed', author: 'نور', rating: 5, comment: 'طبيعة خضراء ومسارات جميلة لمحبي المشي.', createdAt: '2026-03-30' },
  { id: 'r6', placeId: 'masada', authorId: 'seed', author: 'عمر', rating: 4, comment: 'إطلالة مذهلة وموقع تاريخي مميز.', createdAt: '2026-05-08' },
  { id: 'r7', placeId: 'rosh-hanikra', authorId: 'seed', author: 'رهف', rating: 5, comment: 'الكهوف البحرية والمناظر على الساحل رائعة.', createdAt: '2026-07-19' },
  { id: 'r8', placeId: 'agamon-hula', authorId: 'seed', author: 'خالد', rating: 4, comment: 'ممتاز لمشاهدة الطيور والطبيعة الهادئة.', createdAt: '2026-10-25' },
  { id: 'r9', placeId: 'ein-avdat', authorId: 'seed', author: 'دانا', rating: 4, comment: 'مناظر صحراوية جميلة ومسار يستحق التجربة.', createdAt: '2026-07-28' },
]
