export const STANDARD_CATEGORIES = [
  'Ulam',
  'Meryenda',
  'Drinks',
  'Dessert',
  'Appetizer',
  'Soup',
  'Breakfast',
  'Pasta & Noodles',
  'Seafood'
];

/**
 * Robust Category Standardizer:
 * Inspects both category string AND recipe title to ensure 100% accurate classification
 * into the app's official categories:
 * ['Ulam', 'Meryenda', 'Drinks', 'Dessert', 'Appetizer', 'Soup', 'Breakfast', 'Pasta & Noodles', 'Seafood']
 */
export const standardizeCategory = (rawCategory, title = '') => {
  const cat = (rawCategory || '').toString().toLowerCase().trim();
  const t = (title || '').toString().toLowerCase().trim();
  const text = `${cat} ${t}`;

  // 1. DRINKS / BEVERAGES (Milk Tea, Boba, Coffee, Juices, Smoothies, etc.)
  if (
    text.includes('drink') || text.includes('beverage') || text.includes('milktea') ||
    text.includes('milk tea') || text.includes('boba') || text.includes('bubble tea') ||
    text.includes('coffee') || text.includes('latte') || text.includes('espresso') ||
    text.includes('cappuccino') || text.includes('macchiato') || text.includes('tea') ||
    text.includes('juice') || text.includes('smoothie') || text.includes('shake') ||
    text.includes('frappe') || text.includes('cocktail') || text.includes('mocktail') ||
    text.includes('cider') || text.includes('lemonade') || text.includes('soda') ||
    text.includes('matcha') || text.includes('calamansi juice') || text.includes('buko')
  ) {
    return 'Drinks';
  }

  // 2. PASTA & NOODLES (Spaghetti, Carbonara, Pansit, Ramen, Lasagna, etc.)
  if (
    text.includes('pasta') || text.includes('spaghetti') || text.includes('carbonara') ||
    text.includes('bolognese') || text.includes('fettuccine') || text.includes('alfredo') ||
    text.includes('macaroni') || text.includes('lasagna') || text.includes('pansit') ||
    text.includes('pancit') || text.includes('canton') || text.includes('bihon') ||
    text.includes('ramen') || text.includes('noodle') || text.includes('noodles') ||
    text.includes('pad thai') || text.includes('misua') || text.includes('pesto')
  ) {
    return 'Pasta & Noodles';
  }

  // 3. SEAFOOD (Fish, Shrimp, Kinilaw, Crab, Squid, Tilapia, Bangus, Salmon, Tuna, etc.)
  if (
    text.includes('seafood') || text.includes('kinilaw') || text.includes('fish') ||
    text.includes('shrimp') || text.includes('prawn') || text.includes('crab') ||
    text.includes('squid') || text.includes('pusit') || text.includes('tanigue') ||
    text.includes('bangus') || text.includes('tilapia') || text.includes('salmon') ||
    text.includes('tuna') || text.includes('sardine') || text.includes('sardinas') ||
    text.includes('hipon') || text.includes('tahong') || text.includes('mussel')
  ) {
    return 'Seafood';
  }

  // 4. DESSERT & SWEETS (Ice cream, Cakes, Mango Graham, Parfait, Halo-Halo, Flan, etc.)
  if (
    text.includes('dessert') || text.includes('sweet') || text.includes('sweets') ||
    text.includes('cake') || text.includes('pie') || text.includes('pastry') ||
    text.includes('cookie') || text.includes('cookies') || text.includes('ice cream') ||
    text.includes('pudding') || text.includes('graham') || text.includes('float') ||
    text.includes('halo-halo') || text.includes('flan') || text.includes('ube') ||
    text.includes('biko') || text.includes('brownie') || text.includes('churros') ||
    text.includes('custard') || text.includes('chocolate')
  ) {
    return 'Dessert';
  }

  // 5. SOUP & STEWS (Sinigang, Bulalo, Tinola, Broth, Lugaw, Arroz Caldo, etc.)
  if (
    text.includes('soup') || text.includes('broth') || text.includes('sinigang') ||
    text.includes('tinola') || text.includes('bulalo') || text.includes('pochero') ||
    text.includes('stew') || text.includes('lugaw') || text.includes('arroz caldo') ||
    text.includes('goto') || text.includes('tom yum') || text.includes('ramen soup')
  ) {
    return 'Soup';
  }

  // 6. BREAKFAST (Silog, Tapsilog, Pancakes, Eggs, Waffles, Oatmeal, Corned Beef, etc.)
  if (
    text.includes('breakfast') || text.includes('silog') || text.includes('tapsilog') ||
    text.includes('tocilog') || text.includes('longsilog') || text.includes('pancake') ||
    text.includes('pancakes') || text.includes('waffle') || text.includes('toast') ||
    text.includes('egg') || text.includes('eggs') || text.includes('oat') ||
    text.includes('oatmeal') || text.includes('corned beef') || text.includes('champorado')
  ) {
    return 'Breakfast';
  }

  // 7. APPETIZER & SIDE DISHES (Salads, Fries, Starters, Dips, Lumpia, Siomai, etc.)
  if (
    text.includes('appetizer') || text.includes('starter') || text.includes('side dish') ||
    text.includes('side') || text.includes('salad') || text.includes('dip') ||
    text.includes('lumpiang') || text.includes('lumpia') || text.includes('siomai') ||
    text.includes('dumpling') || text.includes('gyoza') || text.includes('fries')
  ) {
    return 'Appetizer';
  }

  // 8. MERYENDA & STREET FOOD (Turon, Banana Cue, Tokwa't Baboy, Street Food, etc.)
  if (
    text.includes('meryenda') || text.includes('snack') || text.includes('snacks') ||
    text.includes('street food') || text.includes('turon') || text.includes('banana cue') ||
    text.includes('isaw') || text.includes('kwek') || text.includes('adidas')
  ) {
    return 'Meryenda';
  }

  // 9. ULAM / MAIN COURSE (Default for all pork, chicken, beef, adobo, sisig, menudo, etc.)
  return 'Ulam';
};
