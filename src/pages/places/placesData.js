export const typeIcons = { desert: '🏜️', sea: '🌊', forest: '🌲', mountain: '⛰️', valley: '🏞️', heritage: '🏛️' }

const arabicRegions = new Map([
  ['Jericho', 'أريحا'],
  ['Bethlehem', 'بيت لحم'],
])

const arabicPlaces = new Map([
  ['wadi-qelt', {
    name: 'وادي القلط',
    description: 'وادٍ صحراوي قرب أريحا تحيط به جروف من الحجر الجيري. تحكي ينابيعه وآثار قنوات المياه القديمة قصة الوادي. الصورة من Hardscarf عبر Wikimedia Commons بترخيص CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/).',
  }],
  ['battir-terraces', {
    name: 'مدرّجات بتّير',
    description: 'تغطي المدرّجات الحجرية وبساتين الزيتون التلال المحيطة ببتّير. وما زالت قنوات تغذّيها الينابيع تروي أجزاء من هذا المشهد الثقافي المدرج على قائمة اليونسكو للتراث العالمي. الصورة من Bukvoed عبر Wikimedia Commons بترخيص CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/).',
  }],
])

export function getLocalizedRegionName(region, language) {
  return language === 'ar' ? arabicRegions.get(region) ?? region : region
}

export function getLocalizedPlaceContent(place, language) {
  const translation = language === 'ar' ? arabicPlaces.get(place.slug) : undefined
  return {
    name: translation?.name ?? place.name,
    region: getLocalizedRegionName(place.region, language),
    description: translation?.description ?? place.description,
  }
}
