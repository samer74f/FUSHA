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

const arabicText = /\p{Script=Arabic}/u

export function localizeGuideRow(row) {
  const builtIn = guide.find((item) => item.id === row.id && item.category === row.category)
  if (!builtIn) return row

  return {
    ...row,
    name: arabicText.test(row.name) ? builtIn.name : row.name,
    description: arabicText.test(row.description) ? builtIn.description : row.description,
    usage: arabicText.test(row.usage) ? builtIn.usage : row.usage,
    selection_tips: arabicText.test(row.selection_tips) ? builtIn.selection_tips : row.selection_tips,
  }
}

export function localizeTemplateRow(row) {
  const builtIn = templates.find((template) =>
    template.id === row.id
    && (template.trip_type ?? null) === (row.trip_type ?? null)
    && (template.terrain ?? null) === (row.terrain ?? null)
    && (template.min_days ?? 1) === (row.min_days ?? 1)
    && template.items.length === row.items.length
  )
  if (!builtIn) return row

  // A built-in item can have an English label while keeping its original saved key.
  return {
    ...row,
    itemLabels: row.items.map((name, index) => arabicText.test(name) ? builtIn.items[index] : name),
  }
}
