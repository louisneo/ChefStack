import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { standardizeCategory } from '../lib/categories';

const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro'
];

const CUSTOM_KEY_STORAGE = '@chefstack_gemini_api_key';
const DEFAULT_GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyBmOS9t2bbaCAWehuTMu98D3kiOsfiMQYE';

// Smart Dynamic Culinary Recipe Generator Fallback (Returns authentic, accurate recipes per food category)
export const generateSmartRecipes = (query) => {
  const q = (query || 'Delight').trim();
  const titleQuery = q.charAt(0).toUpperCase() + q.slice(1);
  const lowerQ = q.toLowerCase();

  // 0. MANGO GRAHAM FLOAT & MANGO DESSERTS
  if (lowerQ.includes('mango graham') || lowerQ.includes('graham float') || lowerQ.includes('graham')) {
    return [
      {
        id: `recipe-mango-graham-1`,
        title: `Classic Mango Graham Float`,
        type: 'food',
        category: 'Dessert',
        prepTime: '20m',
        cookTime: '0m',
        time: 20,
        ingredientsPreview: `2 packs Honey Graham Crackers, 2 ripe Sweet Mangoes (sliced), 2 cups Heavy Whipping Cream, 1 cup Sweetened Condensed Milk`,
        ingredients: [
          '2 packs (200g) Honey Graham Crackers',
          '2 large Ripe Sweet Mangoes (thinly sliced)',
          '2 cups (500ml) Chilled All-Purpose Cream or Heavy Cream',
          '1 cup (300ml) Sweetened Condensed Milk',
          '1/2 cup Crushed Graham Crackers for topping'
        ],
        instructions: [
          'In a large bowl, whip chilled all-purpose cream with sweetened condensed milk until fluffy and smooth.',
          'Arrange a single layer of honey graham crackers at the bottom of a rectangular glass baking dish.',
          'Spread a layer of whipped cream mixture evenly over the graham crackers.',
          'Lay sweet mango slices over the cream layer.',
          'Repeat layers of crackers, cream, and mangoes until dish is filled, finishing with a cream layer topped with mango slices and crushed grahams.',
          'Cover and chill in the freezer for at least 4 hours (or overnight) before slicing and serving cold.'
        ],
        steps: [
          'In a large bowl, whip chilled all-purpose cream with sweetened condensed milk until fluffy and smooth.',
          'Arrange a single layer of honey graham crackers at the bottom of a rectangular glass baking dish.',
          'Spread a layer of whipped cream mixture evenly over the graham crackers.',
          'Lay sweet mango slices over the cream layer.',
          'Repeat layers of crackers, cream, and mangoes until dish is filled, finishing with a cream layer topped with mango slices and crushed grahams.',
          'Cover and chill in the freezer for at least 4 hours (or overnight) before slicing and serving cold.'
        ]
      },
      {
        id: `recipe-mango-graham-2`,
        title: `Mango Graham Cup Parfait`,
        type: 'food',
        category: 'Dessert',
        prepTime: '15m',
        cookTime: '0m',
        time: 15,
        ingredientsPreview: `Crushed Grahams, Sweetened Cream, Fresh Diced Mangoes, Mango Puree`,
        ingredients: [
          '1.5 cups Crushed Graham Crackers',
          '1 cup Chilled Heavy Cream',
          '1/2 cup Condensed Milk',
          '2 Sweet Ripe Mangoes (diced)',
          'Fresh Mint Leaves for garnish'
        ],
        instructions: [
          'Whip heavy cream and condensed milk until smooth.',
          'In individual dessert cups, add a layer of crushed grahams.',
          'Top with a layer of sweet cream followed by diced mangoes.',
          'Repeat layers until cups are filled.',
          'Garnish with fresh mint and chill for 1 hour before serving.'
        ],
        steps: [
          'Whip heavy cream and condensed milk until smooth.',
          'In individual dessert cups, add a layer of crushed grahams.',
          'Top with a layer of sweet cream followed by diced mangoes.',
          'Repeat layers until cups are filled.',
          'Garnish with fresh mint and chill for 1 hour before serving.'
        ]
      }
    ];
  }

  // 1. ICE CREAM, DESSERTS, SWEETS, BAKERY, CAKES & PASTRIES
  const isSweet = lowerQ.includes('ice cream') || lowerQ.includes('gelato') || lowerQ.includes('sorbet') || 
                  lowerQ.includes('sundae') || lowerQ.includes('parfait') || lowerQ.includes('cake') || 
                  lowerQ.includes('pie') || lowerQ.includes('cookie') || lowerQ.includes('donut') || 
                  lowerQ.includes('doughnut') || lowerQ.includes('brownie') || lowerQ.includes('pudding') || 
                  lowerQ.includes('chocolate') || lowerQ.includes('sweet') || lowerQ.includes('dessert') || 
                  lowerQ.includes('tart') || lowerQ.includes('pastry') || lowerQ.includes('waffle') || 
                  lowerQ.includes('pancake') || lowerQ.includes('crepe') || lowerQ.includes('candy') || 
                  lowerQ.includes('sugar') || lowerQ.includes('berry') || lowerQ.includes('vanilla') || 
                  lowerQ.includes('mango') || lowerQ.includes('banana') || lowerQ.includes('strawberry') || 
                  lowerQ.includes('caramel') || lowerQ.includes('custard');

  if (isSweet) {
    return [
      {
        id: `recipe-sweet-1`,
        title: `Classic ${titleQuery} Supreme`,
        type: 'food',
        category: 'Dessert',
        prepTime: '10m',
        cookTime: '20m',
        time: 20,
        ingredientsPreview: `Fresh ${titleQuery} base, Heavy Cream, Sugar, Vanilla Extract`,
        ingredients: [
          `2 cups Fresh ${titleQuery} base`,
          '1 cup Heavy Whipping Cream',
          '3/4 cup Granulated Sugar or Honey',
          '1 tbsp Pure Vanilla Extract',
          'Pinch of Sea Salt'
        ],
        instructions: [
          `Combine fresh ${q} base with heavy whipping cream, sugar, and vanilla extract in a chilled bowl.`,
          'Whisk thoroughly until smooth and well blended.',
          'Chill in the refrigerator or churn in an ice cream maker for 20 minutes.',
          'Scoop into chilled dessert glasses and garnish with mint or fruit.'
        ],
        steps: [
          `Combine fresh ${q} base with heavy whipping cream, sugar, and vanilla extract in a chilled bowl.`,
          'Whisk thoroughly until smooth and well blended.',
          'Chill in the refrigerator or churn in an ice cream maker for 20 minutes.',
          'Scoop into chilled dessert glasses and garnish with mint or fruit.'
        ]
      },
      {
        id: `recipe-sweet-2`,
        title: `Fresh ${titleQuery} Parfait`,
        type: 'food',
        category: 'Dessert',
        prepTime: '10m',
        cookTime: '15m',
        time: 15,
        ingredientsPreview: `Diced ${titleQuery}, Greek Yogurt, Honey Oat Granola, Maple Syrup`,
        ingredients: [
          `1.5 cups Diced or Pureed ${titleQuery}`,
          '1 cup Greek Yogurt or Sweetened Cream',
          '1/2 cup Honey Oat Granola',
          '2 tbsp Maple Syrup or Honey',
          'Fresh Berries for topping'
        ],
        instructions: [
          'Layer Greek yogurt or sweetened cream in tall parfait glasses.',
          `Add a generous layer of prepped ${q} followed by honey oat granola.`,
          'Repeat layers until glasses are filled to the brim.',
          'Drizzle with maple syrup and top with fresh berries before serving cold.'
        ],
        steps: [
          'Layer Greek yogurt or sweetened cream in tall parfait glasses.',
          `Add a generous layer of prepped ${q} followed by honey oat granola.`,
          'Repeat layers until glasses are filled to the brim.',
          'Drizzle with maple syrup and top with fresh berries before serving cold.'
        ]
      },
      {
        id: `recipe-sweet-3`,
        title: `Golden ${titleQuery} Bakery Cake`,
        type: 'food',
        category: 'Dessert',
        prepTime: '15m',
        cookTime: '35m',
        time: 35,
        ingredientsPreview: `${titleQuery} Puree, Flour, Sugar, Butter, Eggs`,
        ingredients: [
          `1 cup ${titleQuery} (pureed or finely diced)`,
          '2 cups All-Purpose Flour',
          '1 cup Sugar',
          '1/2 cup Unsalted Butter (melted)',
          '2 Large Eggs',
          '1 tsp Baking Powder & 1/2 tsp Vanilla'
        ],
        instructions: [
          'Preheat oven to 350°F (175°C) and grease a round cake pan.',
          'Whisk flour, baking powder, and sugar in a large bowl.',
          `Beat eggs with melted butter and vanilla, then fold in ${q} puree.`,
          'Pour batter into pan and bake for 30-35 minutes until a toothpick comes out clean.',
          'Let cool completely before slicing and serving.'
        ],
        steps: [
          'Preheat oven to 350°F (175°C) and grease a round cake pan.',
          'Whisk flour, baking powder, and sugar in a large bowl.',
          `Beat eggs with melted butter and vanilla, then fold in ${q} puree.`,
          'Pour batter into pan and bake for 30-35 minutes until a toothpick comes out clean.',
          'Let cool completely before slicing and serving.'
        ]
      }
    ];
  }

  // 2. CORNED BEEF
  if (lowerQ.includes('corned beef') || lowerQ.includes('cornbeef')) {
    return [
      {
        id: `recipe-cornedbeef-1`,
        title: `Filipino Corned Beef Guisado with Diced Potatoes`,
        type: 'food',
        category: 'Breakfast',
        prepTime: '5m',
        cookTime: '10m',
        time: 15,
        ingredientsPreview: `1 can (340g) Premium Corned Beef, 1 Large Potato (diced), 1/2 cup Minced Onions, 4 cloves Garlic, Cooking Oil`,
        ingredients: [
          '1 can (340g) Premium Canned Corned Beef',
          '1 Large Russet Potato (peeled and finely diced)',
          '1/2 cup Yellow Onion (chopped)',
          '4 cloves Garlic (minced)',
          '2 tbsp Cooking Oil',
          '1/2 tsp Coarsely Ground Black Pepper'
        ],
        instructions: [
          'Heat cooking oil in a skillet over medium heat and deep fry diced potatoes until golden and crispy. Remove and set aside.',
          'In the same skillet, sauté minced garlic and chopped onions until soft and translucent.',
          'Add canned corned beef, breaking up any large chunks with a spatula.',
          'Stir-fry for 4-5 minutes until the corned beef is heated through and slightly crisp at the edges.',
          'Toss in fried potato cubes and season with black pepper. Serve hot over garlic fried rice.'
        ],
        steps: [
          'Heat cooking oil in a skillet over medium heat and deep fry diced potatoes until golden and crispy. Remove and set aside.',
          'In the same skillet, sauté minced garlic and chopped onions until soft and translucent.',
          'Add canned corned beef, breaking up any large chunks with a spatula.',
          'Stir-fry for 4-5 minutes until the corned beef is heated through and slightly crisp at the edges.',
          'Toss in fried potato cubes and season with black pepper. Serve hot over garlic fried rice.'
        ]
      },
      {
        id: `recipe-cornedbeef-2`,
        title: `Sizzling Corned Beef Sisig`,
        type: 'food',
        category: 'Main Course',
        prepTime: '5m',
        cookTime: '10m',
        time: 15,
        ingredientsPreview: `1 can Corned Beef, 1/2 cup Red Onions, 2 Green Chilies, 2 tbsp Mayonnaise, 1 Calamansi, 1 Egg`,
        ingredients: [
          '1 can (340g) Chunky Corned Beef',
          '1/2 cup Red Onions (diced)',
          '2 Green Chilies (Siling Haba, sliced)',
          '2 tbsp Mayonnaise',
          '1 tbsp Liquid Seasoning or Soy Sauce',
          '1 Fresh Calamansi or Lemon',
          '1 Fresh Egg'
        ],
        instructions: [
          'Preheat a heavy cast iron sizzling plate over high heat.',
          'Sauté red onions and green chilies in a pan until fragrant.',
          'Add corned beef and cook until slightly toasted and dry.',
          'Stir in mayonnaise, liquid seasoning, and calamansi juice, tossing rapidly.',
          'Transfer to the sizzling plate, crack a raw egg on top, and serve immediately.'
        ],
        steps: [
          'Preheat a heavy cast iron sizzling plate over high heat.',
          'Sauté red onions and green chilies in a pan until fragrant.',
          'Add corned beef and cook until slightly toasted and dry.',
          'Stir in mayonnaise, liquid seasoning, and calamansi juice, tossing rapidly.',
          'Transfer to the sizzling plate, crack a raw egg on top, and serve immediately.'
        ]
      },
      {
        id: `recipe-cornedbeef-3`,
        title: `Crispy Corned Beef & Potato Hash`,
        type: 'food',
        category: 'Breakfast',
        prepTime: '10m',
        cookTime: '15m',
        time: 25,
        ingredientsPreview: `Corned Beef, 2 Boiled Potatoes (mashed), 1 Egg, 1/4 cup Breadcrumbs, Butter`,
        ingredients: [
          '1 can Corned Beef (drained)',
          '2 Boiled Potatoes (mashed coarsely)',
          '1/2 cup Chopped Yellow Onions',
          '1 Large Egg',
          '1/4 cup Breadcrumbs',
          '2 tbsp Butter for searing'
        ],
        instructions: [
          'In a bowl, mix corned beef, mashed potatoes, chopped onions, egg, and breadcrumbs.',
          'Form mixture into compact 1-inch thick patties.',
          'Melt butter in a non-stick pan over medium heat.',
          'Sear patties for 4-5 minutes per side until a brown crispy crust forms.',
          'Serve with sunny-side-up eggs and toasted bread.'
        ],
        steps: [
          'In a bowl, mix corned beef, mashed potatoes, chopped onions, egg, and breadcrumbs.',
          'Form mixture into compact 1-inch thick patties.',
          'Melt butter in a non-stick pan over medium heat.',
          'Sear patties for 4-5 minutes per side until a brown crispy crust forms.',
          'Serve with sunny-side-up eggs and toasted bread.'
        ]
      }
    ];
  }

  // 3. TOFU / TOKWA
  if (lowerQ.includes('tofu') || lowerQ.includes('tokwa') || lowerQ.includes('mapo')) {
    return [
      {
        id: `recipe-tofu-1`,
        title: `Crispy Tokwa't Baboy (Tofu & Pork)`,
        type: 'food',
        category: 'Main Course',
        prepTime: '15m',
        cookTime: '20m',
        time: 35,
        ingredientsPreview: `400g Firm Tofu, 200g Pork Belly, 1/2 cup Cane Vinegar, 1/4 cup Soy Sauce, 1 Red Onion, Green Chilies`,
        ingredients: [
          '400g Extra Firm Tofu (cubed)',
          '200g Pork Belly (boiled until tender, then sliced)',
          '1/2 cup Cane Vinegar',
          '1/4 cup Soy Sauce',
          '1 Red Onion (diced)',
          '2 Green Chilies (sliced)',
          '1 tbsp Sugar & Pinch of Black Pepper',
          'Oil for deep frying'
        ],
        instructions: [
          'Deep fry firm tofu cubes in hot oil until golden brown and super crispy. Drain on paper towels.',
          'In a bowl, combine cane vinegar, soy sauce, diced red onion, sliced green chilies, sugar, and black pepper.',
          'Toss crispy fried tofu and sliced pork belly together in a serving dish.',
          'Pour the tangy vinegar-soy dressing over top and serve immediately.'
        ],
        steps: [
          'Deep fry firm tofu cubes in hot oil until golden brown and super crispy. Drain on paper towels.',
          'In a bowl, combine cane vinegar, soy sauce, diced red onion, sliced green chilies, sugar, and black pepper.',
          'Toss crispy fried tofu and sliced pork belly together in a serving dish.',
          'Pour the tangy vinegar-soy dressing over top and serve immediately.'
        ]
      },
      {
        id: `recipe-tofu-2`,
        title: `Authentic Spicy Mapo Tofu`,
        type: 'food',
        category: 'Main Course',
        prepTime: '10m',
        cookTime: '15m',
        time: 25,
        ingredientsPreview: `400g Soft Tofu, 150g Ground Pork, 2 tbsp Chili Bean Paste (Doubanjiang), Garlic, Sichuan Peppercorns`,
        ingredients: [
          '400g Soft Silken Tofu (cubed)',
          '150g Ground Pork or Beef',
          '2 tbsp Spicy Chili Bean Paste (Doubanjiang)',
          '3 cloves Garlic & 1 tbsp Ginger (minced)',
          '1 tsp Ground Sichuan Peppercorns',
          '1 cup Chicken Broth & 1 tbsp Cornstarch slurry',
          'Green Onions for garnish'
        ],
        instructions: [
          'Heat oil in a wok and brown ground pork over medium heat.',
          'Add minced garlic, ginger, and spicy chili bean paste, stirring until oil turns red and fragrant.',
          'Pour in chicken broth and bring to a simmer.',
          'Gently slide in soft tofu cubes and cook for 3 minutes without breaking tofu.',
          'Stir in cornstarch slurry to thicken sauce. Sprinkle with Sichuan peppercorns and green onions.'
        ],
        steps: [
          'Heat oil in a wok and brown ground pork over medium heat.',
          'Add minced garlic, ginger, and spicy chili bean paste, stirring until oil turns red and fragrant.',
          'Pour in chicken broth and bring to a simmer.',
          'Gently slide in soft tofu cubes and cook for 3 minutes without breaking tofu.',
          'Stir in cornstarch slurry to thicken sauce. Sprinkle with Sichuan peppercorns and green onions.'
        ]
      },
      {
        id: `recipe-tofu-3`,
        title: `Sizzling Garlic Butter Tofu Sisig`,
        type: 'food',
        category: 'Comfort Food',
        prepTime: '10m',
        cookTime: '10m',
        time: 20,
        ingredientsPreview: `400g Crispy Fried Tofu, 2 tbsp Butter, 5 cloves Garlic, 1 tbsp Oyster Sauce, Mayonnaise, Green Chilies`,
        ingredients: [
          '400g Firm Tofu (cubed and deep-fried crisp)',
          '2 tbsp Butter',
          '5 cloves Garlic (minced)',
          '1 Red Onion (diced)',
          '2 Green Chilies & 1 Siling Labuyo',
          '2 tbsp Mayonnaise & 1 tbsp Oyster Sauce',
          '1 Fresh Calamansi'
        ],
        instructions: [
          'Chop fried tofu into small sisig-sized bits.',
          'Melt butter in a skillet and sauté minced garlic, red onion, and chilies.',
          'Add chopped crispy tofu, tossing with oyster sauce and calamansi juice.',
          'Fold in mayonnaise until creamy.',
          'Serve sizzling hot on a cast iron skillet with garlic rice.'
        ],
        steps: [
          'Chop fried tofu into small sisig-sized bits.',
          'Melt butter in a skillet and sauté minced garlic, red onion, and chilies.',
          'Add chopped crispy tofu, tossing with oyster sauce and calamansi juice.',
          'Fold in mayonnaise until creamy.',
          'Serve sizzling hot on a cast iron skillet with garlic rice.'
        ]
      }
    ];
  }

  // 4. MEATLOAF / LUNCHEON MEAT / SPAM
  if (lowerQ.includes('meat loaf') || lowerQ.includes('meatloaf') || lowerQ.includes('luncheon') || lowerQ.includes('spam')) {
    return [
      {
        id: `recipe-meatloaf-1`,
        title: `Classic Baked Sweet Glazed Meatloaf`,
        type: 'food',
        category: 'Main Course',
        prepTime: '15m',
        cookTime: '45m',
        time: 60,
        ingredientsPreview: `500g Ground Beef & Pork, 1/2 cup Breadcrumbs, 1 Egg, 1/2 cup Onions, Milk, Glaze: Ketchup, Brown Sugar, Mustard`,
        ingredients: [
          '500g Lean Ground Beef or Pork',
          '1/2 cup Italian Breadcrumbs',
          '1 Large Egg',
          '1/2 cup Yellow Onion (finely chopped)',
          '1/4 cup Whole Milk',
          '1/2 tsp Garlic Powder, Salt & Pepper',
          'Glaze: 1/2 cup Ketchup, 2 tbsp Brown Sugar, 1 tbsp Yellow Mustard'
        ],
        instructions: [
          'Preheat oven to 375°F (190°C). Line a loaf pan with parchment paper.',
          'In a large bowl, combine ground meat, breadcrumbs, egg, chopped onion, milk, garlic powder, salt, and pepper. Mix gently until combined.',
          'Press meat mixture evenly into the loaf pan.',
          'Whisk ketchup, brown sugar, and mustard to make glaze, then spread half over top of meatloaf.',
          'Bake for 45 minutes, brushing with remaining glaze halfway through, until internal temperature reaches 160°F (70°C).'
        ],
        steps: [
          'Preheat oven to 375°F (190°C). Line a loaf pan with parchment paper.',
          'In a large bowl, combine ground meat, breadcrumbs, egg, chopped onion, milk, garlic powder, salt, and pepper. Mix gently until combined.',
          'Press meat mixture evenly into the loaf pan.',
          'Whisk ketchup, brown sugar, and mustard to make glaze, then spread half over top of meatloaf.',
          'Bake for 45 minutes, brushing with remaining glaze halfway through, until internal temperature reaches 160°F (70°C).'
        ]
      },
      {
        id: `recipe-meatloaf-2`,
        title: `Sizzling Meatloaf & Egg Skillet`,
        type: 'food',
        category: 'Quick Meal',
        prepTime: '5m',
        cookTime: '10m',
        time: 15,
        ingredientsPreview: `300g Sliced Meatloaf or Luncheon Meat, 4 cloves Garlic, Onions, 2 Eggs, Soy Sauce, Calamansi`,
        ingredients: [
          '300g Sliced Meatloaf or Luncheon Meat (cubed)',
          '4 cloves Garlic (minced)',
          '1/2 cup Red Onion (chopped)',
          '2 Green Chilies',
          '1 tbsp Soy Sauce & 1 tsp Calamansi Juice',
          '2 Fresh Eggs'
        ],
        instructions: [
          'Pan-fry sliced meatloaf cubes in a hot skillet until edges turn brown and crispy.',
          'Sauté minced garlic, onions, and green chilies alongside the meatloaf.',
          'Drizzle with soy sauce and calamansi juice.',
          'Push meatloaf to the sides, crack eggs in center, and cook to desired yolk firmness.',
          'Serve sizzling hot with rice.'
        ],
        steps: [
          'Pan-fry sliced meatloaf cubes in a hot skillet until edges turn brown and crispy.',
          'Sauté minced garlic, onions, and green chilies alongside the meatloaf.',
          'Drizzle with soy sauce and calamansi juice.',
          'Push meatloaf to the sides, crack eggs in center, and cook to desired yolk firmness.',
          'Serve sizzling hot with rice.'
        ]
      },
      {
        id: `recipe-meatloaf-3`,
        title: `Crispy Panko Fried Meatloaf Batons`,
        type: 'food',
        category: 'Appetizer',
        prepTime: '10m',
        cookTime: '10m',
        time: 20,
        ingredientsPreview: `300g Meatloaf, 1/2 cup Flour, 1 Egg, 1/2 cup Panko Breadcrumbs, Oil for frying, Sweet Chili Dip`,
        ingredients: [
          '300g Thick Sliced Meatloaf (cut into 1-inch batons)',
          '1/2 cup All-Purpose Flour',
          '1 Egg (beaten)',
          '1 cup Japanese Panko Breadcrumbs',
          'Oil for deep frying',
          'Sweet Chili or BBQ dipping sauce'
        ],
        instructions: [
          'Dredge meatloaf sticks in flour, dip in beaten egg, and coat thoroughly with panko breadcrumbs.',
          'Heat oil in a deep skillet to 350°F (175°C).',
          'Fry meatloaf batons in batches for 3-4 minutes until golden brown and extra crunchy.',
          'Drain on paper towels and serve with sweet chili dipping sauce.'
        ],
        steps: [
          'Dredge meatloaf sticks in flour, dip in beaten egg, and coat thoroughly with panko breadcrumbs.',
          'Heat oil in a deep skillet to 350°F (175°C).',
          'Fry meatloaf batons in batches for 3-4 minutes until golden brown and extra crunchy.',
          'Drain on paper towels and serve with sweet chili dipping sauce.'
        ]
      }
    ];
  }

  // 5. EGGPLANT / TALONG
  if (lowerQ.includes('talong') || lowerQ.includes('eggplant')) {
    return [
      {
        id: `recipe-talong-1`,
        title: `Authentic Tortang Talong (Filipino Eggplant Omelette)`,
        type: 'food',
        category: 'Main Course',
        prepTime: '10m',
        cookTime: '15m',
        time: 25,
        ingredientsPreview: `2 Long Chinese Eggplants (charred & peeled), 2 Eggs, Salt & Pepper, Cooking Oil`,
        ingredients: [
          '2 Long Chinese Eggplants (stems intact)',
          '2 Large Eggs (beaten with salt & pepper)',
          '1/2 tsp Sea Salt & Black Pepper',
          '3 tbsp Cooking Oil for frying'
        ],
        instructions: [
          'Grill eggplants over open flame or broiler until skin is charred and flesh is tender.',
          'Let cool slightly, then peel off charred skin carefully while leaving stem attached.',
          'Flatten eggplant flesh gently with a fork.',
          'Dip flattened eggplant into beaten eggs, coating completely.',
          'Fry in hot oil for 3-4 minutes per side until golden brown. Serve hot with banana ketchup.'
        ],
        steps: [
          'Grill eggplants over open flame or broiler until skin is charred and flesh is tender.',
          'Let cool slightly, then peel off charred skin carefully while leaving stem attached.',
          'Flatten eggplant flesh gently with a fork.',
          'Dip flattened eggplant into beaten eggs, coating completely.',
          'Fry in hot oil for 3-4 minutes per side until golden brown. Serve hot with banana ketchup.'
        ]
      }
    ];
  }

  // 6. SIOMAI & DUMPLINGS
  if (lowerQ.includes('siomai') || lowerQ.includes('shumai') || lowerQ.includes('dumpling') || lowerQ.includes('dim sum') || lowerQ.includes('wonton') || lowerQ.includes('gyoza')) {
    return [
      {
        id: `recipe-siomai-1`,
        title: `Steamed Pork & Shrimp Siomai`,
        type: 'food',
        category: 'Main Course',
        prepTime: '20m',
        cookTime: '15m',
        time: 15,
        ingredientsPreview: `500g Ground Pork, 150g Minced Shrimp, Water Chestnuts, Egg, Sesame Oil, Siomai Wrappers`,
        ingredients: [
          '500g Ground Pork (with fat)',
          '150g Minced Fresh Shrimp',
          '1/2 cup Minced Water Chestnuts or Carrots',
          '1 Large Egg',
          '1 tbsp Sesame Oil',
          '1 tbsp Light Soy Sauce',
          '1 tsp Cornstarch',
          '30 Wonton/Siomai Wrappers',
          'Chili Garlic Oil & Calamansi for dipping'
        ],
        instructions: [
          'In a large bowl, combine ground pork, minced shrimp, water chestnuts, egg, sesame oil, soy sauce, and cornstarch. Mix vigorously in one direction until sticky.',
          'Place 1 tablespoon of pork mixture in the center of a wrapper. Gather edges around the filling, leaving the top open.',
          'Arrange siomai in a lined bamboo steamer basket.',
          'Steam over boiling water for 15-18 minutes until fully cooked.',
          'Serve piping hot with soy sauce, calamansi, and chili garlic oil.'
        ],
        steps: [
          'In a large bowl, combine ground pork, minced shrimp, water chestnuts, egg, sesame oil, soy sauce, and cornstarch. Mix vigorously in one direction until sticky.',
          'Place 1 tablespoon of pork mixture in the center of a wrapper. Gather edges around the filling, leaving the top open.',
          'Arrange siomai in a lined bamboo steamer basket.',
          'Steam over boiling water for 15-18 minutes until fully cooked.',
          'Serve piping hot with soy sauce, calamansi, and chili garlic oil.'
        ]
      }
    ];
  }

  // 7. PANSIT & NOODLES
  if (lowerQ.includes('pansit') || lowerQ.includes('pancit') || lowerQ.includes('canton') || lowerQ.includes('bihon') || lowerQ.includes('noodle')) {
    return [
      {
        id: `recipe-pansit-1`,
        title: `Traditional Pork & Shrimp Pansit Canton`,
        type: 'food',
        category: 'Main Course',
        prepTime: '15m',
        cookTime: '20m',
        time: 20,
        ingredientsPreview: `250g Pansit Canton Noodles, Pork Belly, Shrimp, Cabbage, Carrots, Snow Peas, Soy Sauce, Oyster Sauce`,
        ingredients: [
          '250g Dried Pansit Canton Noodles',
          '150g Pork Belly (sliced into strips)',
          '100g Medium Shrimp (peeled & deveined)',
          '1 cup Cabbage (shredded)',
          '1/2 cup Carrots (julienned)',
          '1/2 cup Snow Peas (Chicharo)',
          '3 cloves Garlic & 1 Medium Onion',
          '3 tbsp Soy Sauce & 2 tbsp Oyster Sauce',
          '2 cups Chicken Broth',
          'Calamansi wedges for serving'
        ],
        instructions: [
          'Sauté garlic and onions in a wide wok until fragrant.',
          'Add pork belly strips and cook until lightly browned, then toss in shrimp and cook for 2 minutes.',
          'Add soy sauce, oyster sauce, and chicken broth. Bring to a boil.',
          'Toss in cabbage, carrots, and snow peas, simmering for 2 minutes before removing half for garnish.',
          'Submerge dried canton noodles into boiling broth. Toss continuously until noodles absorb liquid and soften.',
          'Transfer to a platter, top with reserved vegetables and shrimp, and serve with calamansi.'
        ],
        steps: [
          'Sauté garlic and onions in a wide wok until fragrant.',
          'Add pork belly strips and cook until lightly browned, then toss in shrimp and cook for 2 minutes.',
          'Add soy sauce, oyster sauce, and chicken broth. Bring to a boil.',
          'Toss in cabbage, carrots, and snow peas, simmering for 2 minutes before removing half for garnish.',
          'Submerge dried canton noodles into boiling broth. Toss continuously until noodles absorb liquid and soften.',
          'Transfer to a platter, top with reserved vegetables and shrimp, and serve with calamansi.'
        ]
      }
    ];
  }

  // 8. MILKSHAKES, SMOOTHIES & DRINKS
  if (lowerQ.includes('milkshake') || lowerQ.includes('shake') || lowerQ.includes('smoothie')) {
    return [
      {
        id: `recipe-shake-1`,
        title: `Classic ${titleQuery}`,
        type: 'drink',
        category: 'Drinks',
        prepTime: '5m',
        cookTime: '0m',
        time: 5,
        ingredientsPreview: `2 cups Fresh Base (Strawberries/Fruit), 3 scoops Vanilla Ice Cream, 1/2 cup Cold Milk, Whipped Cream`,
        ingredients: [
          `2 cups Fresh ${titleQuery} ingredients (e.g. fresh strawberries or fruit)`,
          '3 scoops Premium Vanilla Ice Cream',
          '1/2 cup Whole Milk or Cream',
          '2 tbsp Sugar or Honey (optional)',
          'Whipped Cream & Maraschino Cherry for topping'
        ],
        instructions: [
          `Place fresh ingredients, vanilla ice cream, and cold milk into a high-speed blender.`,
          'Blend on high speed for 45-60 seconds until thick, smooth, and creamy.',
          'Pour into a tall chilled glass.',
          'Top generously with whipped cream and a cherry before serving.'
        ],
        steps: [
          `Place fresh ingredients, vanilla ice cream, and cold milk into a high-speed blender.`,
          'Blend on high speed for 45-60 seconds until thick, smooth, and creamy.',
          'Pour into a tall chilled glass.',
          'Top generously with whipped cream and a cherry before serving.'
        ]
      },
      {
        id: `recipe-shake-2`,
        title: `Creamy ${titleQuery} Thickshake`,
        type: 'drink',
        category: 'Drinks',
        prepTime: '5m',
        cookTime: '0m',
        time: 5,
        ingredientsPreview: `${titleQuery} base, Condensed Milk, Crushed Ice, Cream`,
        ingredients: [
          `1.5 cups ${titleQuery} base`,
          '1/2 cup Heavy Cream',
          '3 tbsp Sweetened Condensed Milk',
          '1 cup Crushed Ice'
        ],
        instructions: [
          'Combine base, heavy cream, condensed milk, and crushed ice in a blender.',
          'Pulse until ice is finely crushed and thick consistency is reached.',
          'Serve immediately cold with a thick straw.'
        ],
        steps: [
          'Combine base, heavy cream, condensed milk, and crushed ice in a blender.',
          'Pulse until ice is finely crushed and thick consistency is reached.',
          'Serve immediately cold with a thick straw.'
        ]
      }
    ];
  }

  // 9. BEVERAGES, DRINKS, COFFEE, TEA, JUICES
  const isDrink = lowerQ.includes('drink') || lowerQ.includes('beverage') || lowerQ.includes('coffee') || 
                  lowerQ.includes('tea') || lowerQ.includes('latte') || lowerQ.includes('espresso') || 
                  lowerQ.includes('juice') || lowerQ.includes('matcha') || lowerQ.includes('boba') || 
                  lowerQ.includes('cocktail') || lowerQ.includes('mocktail') || lowerQ.includes('soda') || 
                  lowerQ.includes('lemonade') || lowerQ.includes('cider');

  if (isDrink) {
    return [
      {
        id: `recipe-drink-1`,
        title: `Iced ${titleQuery} Refreshing Blend`,
        type: 'drink',
        category: 'Drinks',
        prepTime: '5m',
        cookTime: '0m',
        time: 5,
        ingredientsPreview: `Fresh ${titleQuery} base, Whole Milk, Honey, Ice Cubes`,
        ingredients: [
          `1 cup Fresh ${titleQuery} base or juice`,
          '1 cup Cold Water or Whole Milk',
          '2 tbsp Honey or Simple Syrup',
          '1 cup Ice Cubes',
          'Fresh Mint Leaves for garnish'
        ],
        instructions: [
          `Combine ${q} base with milk or cold water in a shaker or pitcher.`,
          'Add honey or simple syrup and stir or shake vigorously for 20 seconds.',
          'Fill a tall serving glass with ice cubes.',
          'Pour drink over ice and garnish with fresh mint leaves.'
        ],
        steps: [
          `Combine ${q} base with milk or cold water in a shaker or pitcher.`,
          'Add honey or simple syrup and stir or shake vigorously for 20 seconds.',
          'Fill a tall serving glass with ice cubes.',
          'Pour drink over ice and garnish with fresh mint leaves.'
        ]
      }
    ];
  }

  // 9. TUNA & FISH DISHES
  if (lowerQ.includes('tuna') || lowerQ.includes('fish') || lowerQ.includes('salmon')) {
    return [
      {
        id: `recipe-tuna-1`,
        title: `Sizzling Tuna Sisig`,
        type: 'food',
        category: 'Main Course',
        prepTime: '10m',
        cookTime: '10m',
        time: 15,
        ingredientsPreview: `1 can Flaked Tuna in Oil, 2 Eggs, Red Onions, Green Chili, Mayonnaise, Soy Sauce, Calamansi`,
        ingredients: ['1 can (180g) Flaked Tuna in Oil (drained)', '2 Eggs', '1/2 cup Chopped Red Onions', '2 Siling Haba (Green Chili, sliced)', '2 tbsp Mayonnaise', '1 tbsp Soy Sauce', '1 Calamansi or Lemon'],
        instructions: ['Sauté red onions and sliced green chilies in a hot skillet until fragrant.', 'Add drained flaked tuna and stir-fry for 3-4 minutes until slightly crispy.', 'Season with soy sauce and calamansi juice.', 'Mix in mayonnaise and crack a fresh egg on top.', 'Serve sizzling hot with warm rice.'],
        steps: ['Sauté red onions and sliced green chilies in a hot skillet until fragrant.', 'Add drained flaked tuna and stir-fry for 3-4 minutes until slightly crispy.', 'Season with soy sauce and calamansi juice.', 'Mix in mayonnaise and crack a fresh egg on top.', 'Serve sizzling hot with warm rice.']
      }
    ];
  }

  // 10. FILIPINO TRADITIONAL DISHES (MENUDO, ADOBO, SINIGANG, SISIG)
  if (lowerQ.includes('menudo')) {
    return [
      {
        id: `recipe-menudo-1`,
        title: `Classic Pork Menudo`,
        type: 'food',
        category: 'Main Course',
        prepTime: '15m',
        cookTime: '35m',
        time: 40,
        ingredientsPreview: `500g Pork Shoulder, 150g Pork Liver, Hotdogs, Potatoes, Carrots, Tomato Sauce, Raisins`,
        ingredients: ['500g Pork Shoulder (cubed)', '150g Pork Liver (cubed)', '2 Hotdogs (sliced)', '1 Potato (diced)', '1 Carrot (diced)', '1 cup Tomato Sauce', '1/4 cup Raisins', 'Garlic & Onion'],
        instructions: ['Marinate pork and liver in soy sauce and calamansi juice for 20 minutes.', 'Sauté garlic and onion in a pot, then brown the marinated pork.', 'Pour in tomato sauce and water, cover and simmer for 25 minutes until pork is tender.', 'Add pork liver, diced potatoes, carrots, hotdogs, and raisins.', 'Simmer for another 10 minutes until vegetables are cooked and sauce thickens.'],
        steps: ['Marinate pork and liver in soy sauce and calamansi juice for 20 minutes.', 'Sauté garlic and onion in a pot, then brown the marinated pork.', 'Pour in tomato sauce and water, cover and simmer for 25 minutes until pork is tender.', 'Add pork liver, diced potatoes, carrots, hotdogs, and raisins.', 'Simmer for another 10 minutes until vegetables are cooked and sauce thickens.']
      }
    ];
  }

  if (lowerQ.includes('adobo')) {
    return [
      {
        id: `recipe-adobo-1`,
        title: `Classic Pork & Chicken Adobo`,
        type: 'food',
        category: 'Main Course',
        prepTime: '15m',
        cookTime: '30m',
        time: 45,
        ingredientsPreview: `500g Pork Belly & Chicken Thighs, Soy Sauce, Vinegar, Garlic, Bay Leaves, Black Peppercorns`,
        ingredients: ['500g Pork Belly & Chicken Thighs', '1/2 cup Soy Sauce', '1/3 cup White Vinegar', '1 Head Garlic (crushed)', '2 Bay Leaves', '1 tsp Whole Black Peppercorns'],
        instructions: ['Combine meat, crushed garlic, soy sauce, bay leaves, and peppercorns in a pot.', 'Simmer covered for 30 minutes until meat is tender.', 'Pour in vinegar and bring to a simmer uncovered without stirring for 10 minutes.', 'Sear meat in a skillet until crisp, then pour adobo sauce back over.'],
        steps: ['Combine meat, crushed garlic, soy sauce, bay leaves, and peppercorns in a pot.', 'Simmer covered for 30 minutes until meat is tender.', 'Pour in vinegar and bring to a simmer uncovered without stirring for 10 minutes.', 'Sear meat in a skillet until crisp, then pour adobo sauce back over.']
      }
    ];
  }

  if (lowerQ.includes('sinigang')) {
    return [
      {
        id: `recipe-sinigang-1`,
        title: `Sinigang na Baboy (Pork Sour Soup)`,
        type: 'food',
        category: 'Soup',
        prepTime: '15m',
        cookTime: '35m',
        time: 45,
        ingredientsPreview: `500g Pork Ribs, Tamarind Soup Base, Kangkong, Radish, Eggplant, Tomatoes, Siling Haba`,
        ingredients: ['500g Pork Ribs', '1 packet Tamarind Soup Base (Sampaloc)', '1 bunch Kangkong (Water Spinach)', '1 Radish (sliced)', '1 Eggplant', '2 Tomatoes (quartered)', '1 Onion', '2 Siling Haba'],
        instructions: ['Boil pork ribs with onions and tomatoes in a pot for 35 minutes until tender.', 'Stir in tamarind soup base until sour flavor is reached.', 'Add radish, eggplant, and green chilies, simmering for 5 minutes.', 'Add kangkong leaves, turn off heat, cover, and let residual heat cook greens.'],
        steps: ['Boil pork ribs with onions and tomatoes in a pot for 35 minutes until tender.', 'Stir in tamarind soup base until sour flavor is reached.', 'Add radish, eggplant, and green chilies, simmering for 5 minutes.', 'Add kangkong leaves, turn off heat, cover, and let residual heat cook greens.']
      }
    ];
  }

  if (lowerQ.includes('sisig')) {
    return [
      {
        id: `recipe-sisig-1`,
        title: `Authentic Sizzling Pork Sisig`,
        type: 'food',
        category: 'Main Course',
        prepTime: '15m',
        cookTime: '20m',
        time: 35,
        ingredientsPreview: `500g Pork Belly & Ear, Red Onions, Chilies, Mayonnaise, Soy Sauce, Calamansi, Egg`,
        ingredients: ['500g Pork Belly / Ear (boiled & grilled)', '1 cup Chopped Red Onions', '3 Siling Haba & Siling Labuyo', '3 tbsp Mayonnaise', '2 tbsp Soy Sauce', '2 Calamansi', '1 Egg'],
        instructions: ['Boil pork until tender, grill over charcoal until smoky, then chop into fine pieces.', 'Sauté chopped pork with onions and chilies in a cast iron skillet.', 'Season with soy sauce, calamansi juice, and mayonnaise.', 'Crack an egg on top while sizzling and serve.'],
        steps: ['Boil pork until tender, grill over charcoal until smoky, then chop into fine pieces.', 'Sauté chopped pork with onions and chilies in a cast iron skillet.', 'Season with soy sauce, calamansi juice, and mayonnaise.', 'Crack an egg on top while sizzling and serve.']
      }
    ];
  }

  // 11. DYNAMIC INGREDIENT MATCHING & AUTHENTIC RECIPE DISPATCHER FOR ANY USER QUERY
  let isBeef = lowerQ.includes('beef') || lowerQ.includes('steak');
  let isChicken = lowerQ.includes('chicken') || lowerQ.includes('wing') || lowerQ.includes('poultry');
  let isPork = lowerQ.includes('pork') || lowerQ.includes('pig') || lowerQ.includes('bacon');

  if (isBeef) {
    return [
      {
        id: `recipe-beef-1`,
        title: `Authentic Bistek Tagalog (${titleQuery} Beef Steak)`,
        type: 'food',
        category: 'Main Course',
        prepTime: '15m',
        cookTime: '20m',
        time: 35,
        ingredientsPreview: `500g Beef Sirloin (thinly sliced), Soy Sauce, Calamansi Juice, Large Onion Rings, Garlic, Black Pepper`,
        ingredients: ['500g Beef Sirloin (thinly sliced)', '1/3 cup Soy Sauce', '1/4 cup Calamansi or Lemon Juice', '2 Large White Onions (cut into rings)', '4 cloves Garlic (minced)', '1/2 tsp Ground Black Pepper', '2 tbsp Cooking Oil'],
        instructions: ['Marinate sliced beef in soy sauce, calamansi juice, and black pepper for 30 minutes.', 'Heat oil in a skillet and pan-fry onion rings for 2 minutes until translucent. Remove onion rings.', 'In the same pan, sear beef slices in single layers for 1-2 minutes per side.', 'Pour remaining marinade into the pan and simmer for 5 minutes until beef is tender.', 'Top with fried onion rings and serve hot with steamed rice.'],
        steps: ['Marinate sliced beef in soy sauce, calamansi juice, and black pepper for 30 minutes.', 'Heat oil in a skillet and pan-fry onion rings for 2 minutes until translucent. Remove onion rings.', 'In the same pan, sear beef slices in single layers for 1-2 minutes per side.', 'Pour remaining marinade into the pan and simmer for 5 minutes until beef is tender.', 'Top with fried onion rings and serve hot with steamed rice.']
      },
      {
        id: `recipe-beef-2`,
        title: `Rich ${titleQuery} Caldereta Stew`,
        type: 'food',
        category: 'Main Course',
        prepTime: '20m',
        cookTime: '40m',
        time: 60,
        ingredientsPreview: `500g Beef Chuck, Tomato Sauce, Liver Spread, Potatoes, Carrots, Bell Peppers, Cheese`,
        ingredients: ['500g Beef Chuck (cubed)', '1 cup Tomato Sauce', '1/2 cup Liver Spread', '1 Large Potato & 1 Carrot (cubed)', '1 Red Bell Pepper (sliced)', '1/2 cup Shredded Cheese', 'Garlic & Onion'],
        instructions: ['Sauté garlic and onions, then brown beef cubes.', 'Pour in tomato sauce and beef broth, simmering covered for 45 minutes until beef is tender.', 'Stir in liver spread, potatoes, and carrots, cooking for 10 minutes.', 'Add bell peppers and shredded cheese, stirring until sauce is thick and creamy.'],
        steps: ['Sauté garlic and onions, then brown beef cubes.', 'Pour in tomato sauce and beef broth, simmering covered for 45 minutes until beef is tender.', 'Stir in liver spread, potatoes, and carrots, cooking for 10 minutes.', 'Add bell peppers and shredded cheese, stirring until sauce is thick and creamy.']
      }
    ];
  }

  if (isChicken) {
    return [
      {
        id: `recipe-chicken-1`,
        title: `Crispy Honey Garlic ${titleQuery}`,
        type: 'food',
        category: 'Main Course',
        prepTime: '15m',
        cookTime: '20m',
        time: 35,
        ingredientsPreview: `500g Chicken Cutlets, Cornstarch Coating, Honey Garlic Glaze, Sesame Seeds`,
        ingredients: ['500g Chicken Cutlets', '1/2 cup Cornstarch', '1 Egg', '4 tbsp Honey', '4 cloves Garlic (minced)', '2 tbsp Soy Sauce', '1 tbsp Sesame Oil', 'Oil for frying'],
        instructions: ['Coat chicken cutlets in egg and cornstarch.', 'Deep fry in hot oil for 6-8 minutes until golden and extra crispy.', 'In a separate skillet, simmer minced garlic, honey, soy sauce, and sesame oil for 2 minutes.', 'Toss crispy chicken into honey garlic glaze and sprinkle with sesame seeds.'],
        steps: ['Coat chicken cutlets in egg and cornstarch.', 'Deep fry in hot oil for 6-8 minutes until golden and extra crispy.', 'In a separate skillet, simmer minced garlic, honey, soy sauce, and sesame oil for 2 minutes.', 'Toss crispy chicken into honey garlic glaze and sprinkle with sesame seeds.']
      }
    ];
  }

  if (isPork) {
    return [
      {
        id: `recipe-pork-1`,
        title: `Crispy Sweet & Sour ${titleQuery}`,
        type: 'food',
        category: 'Main Course',
        prepTime: '15m',
        cookTime: '20m',
        time: 35,
        ingredientsPreview: `500g Pork Shoulder (cubed), Pineapple Chunks, Bell Peppers, Ketchup, Rice Vinegar, Sugar`,
        ingredients: ['500g Pork Shoulder (cubed)', '1/2 cup Cornstarch', '1 cup Pineapple Chunks in Juice', '1 Red & Green Bell Pepper', '3 tbsp Ketchup', '2 tbsp Rice Vinegar', '2 tbsp Sugar'],
        instructions: ['Coat pork cubes in cornstarch and deep fry until crispy and golden brown.', 'Sauté bell peppers and pineapple chunks in a skillet for 2 minutes.', 'Add ketchup, rice vinegar, pineapple juice, and sugar, simmering until sauce thickens.', 'Toss crispy fried pork into sweet and sour sauce and serve hot.'],
        steps: ['Coat pork cubes in cornstarch and deep fry until crispy and golden brown.', 'Sauté bell peppers and pineapple chunks in a skillet for 2 minutes.', 'Add ketchup, rice vinegar, pineapple juice, and sugar, simmering until sauce thickens.', 'Toss crispy fried pork into sweet and sour sauce and serve hot.']
      }
    ];
  }

  // 12. ADIDAS (FILIPINO CHICKEN FEET / STREET FOOD)
  if (lowerQ.includes('adidas') || lowerQ.includes('chicken feet') || lowerQ.includes('chicken foot') || lowerQ.includes('isaw') || lowerQ.includes('kwek')) {
    return [
      {
        id: `recipe-adidas-1`,
        title: `Inihaw na Adidas (Filipino Street-Style Grilled Chicken Feet)`,
        type: 'food',
        category: 'Appetizer',
        prepTime: '20m',
        cookTime: '25m',
        time: 45,
        ingredientsPreview: `500g Cleaned Chicken Feet, 1/4 cup Banana Ketchup, 3 tbsp Soy Sauce, 1 tbsp Brown Sugar, 2 Calamansi, Garlic`,
        ingredients: [
          '500g Cleaned Chicken Feet (claws removed & boiled tender)',
          '1/4 cup Banana Ketchup',
          '3 tbsp Soy Sauce',
          '1 tbsp Brown Sugar',
          '2 fresh Calamansi (juiced)',
          '4 cloves Garlic (minced)',
          '1/2 tsp Ground Black Pepper'
        ],
        instructions: [
          'Boil cleaned chicken feet with garlic, salt, and black pepper for 25-30 minutes until soft and tender. Drain well.',
          'In a bowl, mix banana ketchup, soy sauce, brown sugar, calamansi juice, and minced garlic to make the sweet-savory glaze.',
          'Skewer 3-4 chicken feet onto bamboo sticks.',
          'Grill over hot charcoal for 8-10 minutes, brushing generously with glaze continuously until caramelized and charred.',
          'Serve piping hot with spiced vinegar dipping sauce.'
        ],
        steps: [
          'Boil cleaned chicken feet with garlic, salt, and black pepper for 25-30 minutes until soft and tender. Drain well.',
          'In a bowl, mix banana ketchup, soy sauce, brown sugar, calamansi juice, and minced garlic to make the sweet-savory glaze.',
          'Skewer 3-4 chicken feet onto bamboo sticks.',
          'Grill over hot charcoal for 8-10 minutes, brushing generously with glaze continuously until caramelized and charred.',
          'Serve piping hot with spiced vinegar dipping sauce.'
        ]
      },
      {
        id: `recipe-adidas-2`,
        title: `Spicy Adobong Adidas (Braised Chicken Feet)`,
        type: 'food',
        category: 'Main Course',
        prepTime: '15m',
        cookTime: '30m',
        time: 45,
        ingredientsPreview: `500g Chicken Feet, 1/3 cup Soy Sauce, 1/4 cup Cane Vinegar, 6 cloves Garlic, Bay Leaves, Siling Labuyo`,
        ingredients: [
          '500g Chicken Feet (cleaned & pre-boiled)',
          '1/3 cup Soy Sauce',
          '1/4 cup Cane Vinegar',
          '6 cloves Garlic (crushed)',
          '3 dried Bay Leaves',
          '1 tsp Whole Black Peppercorns',
          '3 Siling Labuyo (Birdseye Chilies, chopped)',
          '1 tbsp Cooking Oil'
        ],
        instructions: [
          'Heat oil in a heavy pot and sauté crushed garlic until light golden.',
          'Add chicken feet, soy sauce, bay leaves, peppercorns, and chopped chilies. Simmer for 5 minutes.',
          'Pour in 1 cup water, cover and simmer for 25 minutes until chicken feet are melt-in-your-mouth tender.',
          'Pour in cane vinegar and let simmer uncovered for 10 minutes without stirring.',
          'Reduce sauce until thick and glossy. Serve with hot steamed rice.'
        ],
        steps: [
          'Heat oil in a heavy pot and sauté crushed garlic until light golden.',
          'Add chicken feet, soy sauce, bay leaves, peppercorns, and chopped chilies. Simmer for 5 minutes.',
          'Pour in 1 cup water, cover and simmer for 25 minutes until chicken feet are melt-in-your-mouth tender.',
          'Pour in cane vinegar and let simmer uncovered for 10 minutes without stirring.',
          'Reduce sauce until thick and glossy. Serve with hot steamed rice.'
        ]
      },
      {
        id: `recipe-adidas-3`,
        title: `Crispy Deep-Fried Adidas with Spiced Vinegar`,
        type: 'food',
        category: 'Appetizer',
        prepTime: '15m',
        cookTime: '15m',
        time: 30,
        ingredientsPreview: `500g Boiled Chicken Feet, 3/4 cup Seasoned Cornstarch, 1 Egg, 1/2 tsp Garlic Powder, Oil, Spicy Dip`,
        ingredients: [
          '500g Chicken Feet (boiled tender & thoroughly dried)',
          '3/4 cup Cornstarch',
          '1 Egg (beaten)',
          '1 tsp Garlic Powder & Paprika',
          '1/2 tsp Salt & Pepper',
          'Oil for deep frying',
          'Spiced Cane Vinegar with Onion & Chili for dipping'
        ],
        instructions: [
          'Pat boiled chicken feet completely dry with paper towels to avoid oil splatter.',
          'Toss chicken feet in beaten egg, then coat thoroughly in cornstarch seasoned with garlic powder, paprika, salt, and pepper.',
          'Heat oil in a deep fryer or deep skillet to 350°F (175°C).',
          'Fry chicken feet in batches for 5-6 minutes until golden brown and super crispy.',
          'Drain on paper towels and serve immediately with spiced vinegar dip.'
        ],
        steps: [
          'Pat boiled chicken feet completely dry with paper towels to avoid oil splatter.',
          'Toss chicken feet in beaten egg, then coat thoroughly in cornstarch seasoned with garlic powder, paprika, salt, and pepper.',
          'Heat oil in a deep fryer or deep skillet to 350°F (175°C).',
          'Fry chicken feet in batches for 5-6 minutes until golden brown and super crispy.',
          'Drain on paper towels and serve immediately with spiced vinegar dip.'
        ]
      }
    ];
  }

  // 13. SPINACH, KANGKONG & LEAFY GREENS
  if (lowerQ.includes('spinach') || lowerQ.includes('kangkong') || lowerQ.includes('kale') || lowerQ.includes('greens') || lowerQ.includes('lettuce')) {
    return [
      {
        id: `recipe-spinach-1`,
        title: `Garlic Butter Sautéed ${titleQuery}`,
        type: 'food',
        category: 'Side Dish',
        prepTime: '5m',
        cookTime: '5m',
        time: 10,
        ingredientsPreview: `400g Fresh ${titleQuery} Leaves, 3 tbsp Unsalted Butter, 6 cloves Garlic (minced), Parmesan, Salt & Pepper`,
        ingredients: [
          `400g Fresh ${titleQuery} Leaves (washed & trimmed)`,
          '3 tbsp Unsalted Butter',
          '6 cloves Garlic (minced)',
          '2 tbsp Grated Parmesan Cheese',
          '1/4 tsp Sea Salt & Freshly Cracked Black Pepper',
          '1 tsp Lemon Juice'
        ],
        instructions: [
          'Melt butter in a wide skillet over medium heat.',
          'Add minced garlic and sauté for 1-2 minutes until golden and fragrant.',
          `Toss in fresh ${q} leaves in batches, turning with tongs as they wilt rapidly.`,
          'Cook for just 2-3 minutes until bright green and tender.',
          'Season with sea salt, black pepper, grated parmesan cheese, and a squeeze of fresh lemon juice before serving.'
        ],
        steps: [
          'Melt butter in a wide skillet over medium heat.',
          'Add minced garlic and sauté for 1-2 minutes until golden and fragrant.',
          `Toss in fresh ${q} leaves in batches, turning with tongs as they wilt rapidly.`,
          'Cook for just 2-3 minutes until bright green and tender.',
          'Season with sea salt, black pepper, grated parmesan cheese, and a squeeze of fresh lemon juice before serving.'
        ]
      },
      {
        id: `recipe-spinach-2`,
        title: `Crispy Fried ${titleQuery} Leaves (Kangkong Crisps)`,
        type: 'food',
        category: 'Appetizer',
        prepTime: '10m',
        cookTime: '10m',
        time: 20,
        ingredientsPreview: `300g Fresh ${titleQuery} Leaves, 1/2 cup Cornstarch, 1 Egg, Ice Water, Garlic Powder, Mayo Dip`,
        ingredients: [
          `300g Fresh ${titleQuery} Leaves (washed & thoroughly dried)`,
          '1/2 cup Cornstarch',
          '1/4 cup All-Purpose Flour',
          '1 Egg (beaten)',
          '1/2 cup Ice-cold Water',
          '1/2 tsp Garlic Powder & Salt',
          'Oil for deep frying',
          'Garlic Mayonnaise or Sweet Chili Dip'
        ],
        instructions: [
          'Whisk cornstarch, flour, egg, ice-cold water, garlic powder, and salt into a smooth thin batter.',
          'Heat deep oil to 350°F (175°C).',
          `Dip individual dry ${q} leaves into batter, letting excess drip off.`,
          'Fry leaves in small batches for 1-2 minutes until pale golden and crispy.',
          'Drain on paper towels and serve crispy with garlic mayonnaise dip.'
        ],
        steps: [
          'Whisk cornstarch, flour, egg, ice-cold water, garlic powder, and salt into a smooth thin batter.',
          'Heat deep oil to 350°F (175°C).',
          `Dip individual dry ${q} leaves into batter, letting excess drip off.`,
          'Fry leaves in small batches for 1-2 minutes until pale golden and crispy.',
          'Drain on paper towels and serve crispy with garlic mayonnaise dip.'
        ]
      },
      {
        id: `recipe-spinach-3`,
        title: `Creamy ${titleQuery} & Garlic Dip`,
        type: 'food',
        category: 'Side Dish',
        prepTime: '10m',
        cookTime: '10m',
        time: 20,
        ingredientsPreview: `300g Cooked ${titleQuery}, 1/2 cup Cream Cheese, 1/4 cup Heavy Cream, Mozzarella, Garlic, Toast`,
        ingredients: [
          `300g Fresh ${titleQuery} (blanched & chopped)`,
          '1/2 cup Cream Cheese (softened)',
          '1/4 cup Sour Cream or Heavy Cream',
          '1/2 cup Shredded Mozzarella & Parmesan',
          '3 cloves Garlic (minced)',
          'Toasted Baguette slices for serving'
        ],
        instructions: [
          `Squeeze all excess moisture from blanched ${q} and chop coarsely.`,
          'In a bowl, mix cream cheese, sour cream, minced garlic, half the mozzarella, and chopped greens.',
          'Transfer mixture to a baking dish and top with remaining mozzarella and parmesan.',
          'Bake at 375°F (190°C) for 15 minutes until bubbly and golden brown on top.',
          'Serve warm with toasted baguette slices.'
        ],
        steps: [
          `Squeeze all excess moisture from blanched ${q} and chop coarsely.`,
          'In a bowl, mix cream cheese, sour cream, minced garlic, half the mozzarella, and chopped greens.',
          'Transfer mixture to a baking dish and top with remaining mozzarella and parmesan.',
          'Bake at 375°F (190°C) for 15 minutes until bubbly and golden brown on top.',
          'Serve warm with toasted baguette slices.'
        ]
      }
    ];
  }

  // 14. DYNAMIC VEGETABLE & GENERAL INGREDIENT RECIPE DISPATCHER
  const isVeg = lowerQ.includes('veg') || lowerQ.includes('broccoli') || lowerQ.includes('mushroom') || 
                lowerQ.includes('cabbage') || lowerQ.includes('carrot') || lowerQ.includes('corn') || 
                lowerQ.includes('potato') || lowerQ.includes('squash') || lowerQ.includes('bean');

  if (isVeg) {
    return [
      {
        id: `recipe-veg-1`,
        title: `Garlic Butter Stir-Fried ${titleQuery}`,
        type: 'food',
        category: 'Side Dish',
        prepTime: '10m',
        cookTime: '10m',
        time: 20,
        ingredientsPreview: `400g Fresh ${titleQuery}, 3 tbsp Unsalted Butter, 5 cloves Garlic (minced), 1 tbsp Oyster Sauce, Sesame Oil`,
        ingredients: [
          `400g Cleaned & Cut ${titleQuery}`,
          '3 tbsp Unsalted Butter',
          '5 cloves Garlic (minced)',
          '1 tbsp Oyster Sauce',
          '1 tsp Pure Sesame Oil',
          '1/4 tsp Salt & Cracked Black Pepper'
        ],
        instructions: [
          `Blanch or wash prepped ${q} in warm salted water for 2 minutes, then drain well.`,
          'Melt butter in a hot wok over medium-high heat and sauté minced garlic until golden.',
          `Toss in ${q} and stir-fry vigorously for 3-4 minutes until tender crisp.`,
          'Drizzle with oyster sauce and sesame oil, tossing to coat evenly.',
          'Transfer to a platter and serve warm.'
        ],
        steps: [
          `Blanch or wash prepped ${q} in warm salted water for 2 minutes, then drain well.`,
          'Melt butter in a hot wok over medium-high heat and sauté minced garlic until golden.',
          `Toss in ${q} and stir-fry vigorously for 3-4 minutes until tender crisp.`,
          'Drizzle with oyster sauce and sesame oil, tossing to coat evenly.',
          'Transfer to a platter and serve warm.'
        ]
      },
      {
        id: `recipe-veg-2`,
        title: `Ginataang ${titleQuery} (Vegetable Coconut Curry)`,
        type: 'food',
        category: 'Main Course',
        prepTime: '10m',
        cookTime: '20m',
        time: 30,
        ingredientsPreview: `400g Fresh ${titleQuery}, 1.5 cups Coconut Milk (Gata), 150g Tofu or Pork, Garlic, Onion, Green Chili`,
        ingredients: [
          `400g Chopped ${titleQuery}`,
          '1.5 cups Coconut Milk',
          '150g Fried Tofu Cubes',
          '4 cloves Garlic (minced)',
          '1 Onion (chopped)',
          '1 tbsp Fish Sauce or Soy Sauce',
          '2 Green Chilies'
        ],
        instructions: [
          'Sauté garlic and onions in a pot until translucent.',
          'Pour in coconut milk and bring to a gentle simmer over medium-low heat for 5 minutes.',
          `Add prepped ${q} and fried tofu cubes, simmering until vegetables are soft and coconut sauce thickens.`,
          'Season with fish sauce and add green chilies for a mild spicy kick.',
          'Serve warm over garlic rice.'
        ],
        steps: [
          'Sauté garlic and onions in a pot until translucent.',
          'Pour in coconut milk and bring to a gentle simmer over medium-low heat for 5 minutes.',
          `Add prepped ${q} and fried tofu cubes, simmering until vegetables are soft and coconut sauce thickens.`,
          'Season with fish sauce and add green chilies for a mild spicy kick.',
          'Serve warm over garlic rice.'
        ]
      }
    ];
  }

  // 15. DYNAMIC AUTHENTIC RECIPE DISPATCHER FOR ANY OTHER SPECIFIC FOOD QUERY
  return [
    {
      id: `recipe-custom-1`,
      title: `Chef's Special Pan-Seared ${titleQuery} Delicacy`,
      type: 'food',
      category: 'Main Course',
      prepTime: '15m',
      cookTime: '20m',
      time: 35,
      ingredientsPreview: `500g Prepped ${titleQuery}, 2 tbsp Olive Oil or Butter, 4 cloves Garlic, Fresh Herbs, Lemon Juice`,
      ingredients: [
        `500g Freshly Prepared ${titleQuery}`,
        '2 tbsp Extra Virgin Olive Oil or Butter',
        '4 cloves Garlic (minced)',
        '1/4 cup Fresh Parsley or Green Onions (chopped)',
        '1 tbsp Fresh Lemon Juice or Seasoning',
        '1/2 tsp Sea Salt & Cracked Black Pepper'
      ],
      instructions: [
        `Clean and trim ${q} thoroughly into uniform cooking pieces.`,
        'Heat olive oil or butter in a wide skillet over medium-high heat.',
        'Sauté minced garlic for 1 minute until fragrant, then add prepped item.',
        `Sear ${q} for 6-8 minutes until perfectly caramelized and cooked through.`,
        'Finish with a drizzle of fresh lemon juice and chopped parsley before serving.'
      ],
      steps: [
        `Clean and trim ${q} thoroughly into uniform cooking pieces.`,
        'Heat olive oil or butter in a wide skillet over medium-high heat.',
        'Sauté minced garlic for 1 minute until fragrant, then add prepped item.',
        `Sear ${q} for 6-8 minutes until perfectly caramelized and cooked through.`,
        'Finish with a drizzle of fresh lemon juice and chopped parsley before serving.'
      ]
    },
    {
      id: `recipe-custom-2`,
      title: `Crispy Battered ${titleQuery} Bites`,
      type: 'food',
      category: 'Appetizer',
      prepTime: '10m',
      cookTime: '10m',
      time: 20,
      ingredientsPreview: `400g Seasoned ${titleQuery}, 1/2 cup Cornstarch, 1 Egg, Garlic Powder, Dipping Sauce`,
      ingredients: [
        `400g Cut ${titleQuery}`,
        '1/2 cup Cornstarch or Seasoned Flour',
        '1 Egg (beaten)',
        '1/2 tsp Garlic Powder & Smoked Paprika',
        'Oil for frying',
        'Dipping Sauce of choice'
      ],
      instructions: [
        `Season ${q} with garlic powder, paprika, and salt.`,
        'Dip pieces in beaten egg, then coat thoroughly in cornstarch.',
        'Heat deep oil to 350°F (175°C).',
        'Fry in batches for 4-5 minutes until golden brown and crispy.',
        'Drain on paper towels and serve hot with dipping sauce.'
      ],
      steps: [
        `Season ${q} with garlic powder, paprika, and salt.`,
        'Dip pieces in beaten egg, then coat thoroughly in cornstarch.',
        'Heat deep oil to 350°F (175°C).',
        'Fry in batches for 4-5 minutes until golden brown and crispy.',
        'Drain on paper towels and serve hot with dipping sauce.'
      ]
    }
  ];
};


// Structured JSON schema for Gemini SDK structured output
const recipeSchema = {
  type: SchemaType.OBJECT,
  properties: {
    recipes: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          title: { type: SchemaType.STRING },
          category: { type: SchemaType.STRING },
          prepTime: { type: SchemaType.STRING },
          cookTime: { type: SchemaType.STRING },
          ingredientsPreview: { type: SchemaType.STRING },
          ingredients: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING }
          },
          instructions: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING }
          }
        },
        required: ["id", "title", "category", "prepTime", "ingredientsPreview", "ingredients", "instructions"]
      }
    }
  },
  required: ["recipes"]
};

const SYSTEM_PROMPT = `You are an expert master chef API for ChefStack.

RULES:
1. FOOD VALIDATION: Check if the user query refers to a real food, ingredient, dish, beverage, or cooking style. If the query is random gibberish, non-food text (e.g., "asdasd", "qwerty", "12345"), or completely unrelated to food, return {"recipes": []}.
2. NO GENERIC TEMPLATES: Never output generic "Bistro Plate", "Pan-Seared Delicacy", or "Asdasd Delicacy" templates.
3. REAL DISHES ONLY: Generate 5 to 6 distinct, authentic, real-world dishes based on the food query.
4. CATEGORY MANDATE: The "category" field MUST be strictly one of: "Ulam", "Meryenda", "Drinks", "Dessert", "Appetizer", "Soup", "Breakfast".
5. COMPLETE INGREDIENTS: Use full, accurate ingredient lists and step-by-step instructions.
6. STRICT JSON: Output valid JSON adhering strictly to the schema.`;

// Cache key prefix for resource distribution
const CACHE_PREFIX = '@chefstack_search_cache_';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Gets all available Gemini API keys from custom storage or environment variable.
 * Supports comma-separated keys for API key chaining / account pooling.
 */
export const getApiKeyPool = async () => {
  let customKeysRaw = await AsyncStorage.getItem(CUSTOM_KEY_STORAGE).catch(() => null);
  let keys = [];

  if (customKeysRaw && customKeysRaw.trim()) {
    keys = customKeysRaw
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 5);
  }

  if (keys.length === 0 && DEFAULT_GEMINI_KEY) {
    keys = DEFAULT_GEMINI_KEY
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 5);
  }

  return keys;
};

/**
 * Searches for recipes using Google Gemini AI SDK with Google Search grounding.
 * Features:
 * 1. Resource Distribution: Caches search results in AsyncStorage for 24 hours.
 * 2. API Chaining / Multi-Account Key Pool: Rotates through available keys on 429 / quota errors.
 * 3. Fallback: Uses offline Smart Recipe Engine if all keys or network requests fail.
 */
export const searchRecipes = async (query) => {
  const cleanQuery = (query || '').trim();
  if (!cleanQuery) return { recipes: [], isFood: true };

  const cacheKey = `${CACHE_PREFIX}${cleanQuery.toLowerCase()}`;

  // 1. Resource Distribution: Check local AsyncStorage cache first
  try {
    const cachedDataRaw = await AsyncStorage.getItem(cacheKey);
    if (cachedDataRaw) {
      const cached = JSON.parse(cachedDataRaw);
      if (Date.now() - cached.timestamp < CACHE_TTL_MS && cached.recipes?.length > 0) {
        console.log(`ChefStack Cache Hit: Serving cached AI response for "${cleanQuery}"`);
        return { recipes: cached.recipes, isFood: true, needsApiKey: false, isCached: true };
      }
    }
  } catch (e) {
    console.warn('Cache read error:', e);
  }

  // 2. Retrieve API Key Pool for chaining across Google accounts
  const keyPool = await getApiKeyPool();
  const isKeyValid = keyPool.length > 0;

  if (isKeyValid) {
    const candidateModels = [
      'gemini-2.5-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro'
    ];

    const prompt = `Generate 5 to 6 real, authentic, distinct recipes for: "${cleanQuery}" with complete ingredient lists and step-by-step instructions.`;

    // Chain across key pool (different Google accounts)
    for (let keyIdx = 0; keyIdx < keyPool.length; keyIdx++) {
      const currentApiKey = keyPool[keyIdx];
      const genAI = new GoogleGenerativeAI(currentApiKey);

      for (const modelName of candidateModels) {
        try {
          console.log(`ChefStack AI SDK: Trying Key #${keyIdx + 1}/${keyPool.length} with model ${modelName}...`);

          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: SYSTEM_PROMPT,
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: recipeSchema,
              temperature: 0.7
            }
          });

          const result = await model.generateContent(prompt);
          const responseText = result.response.text();

          if (responseText) {
            let cleanJson = responseText.trim().replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
            const parsed = JSON.parse(cleanJson);
            let recipes = Array.isArray(parsed) ? parsed : (parsed.recipes || []);

            if (recipes.length > 0) {
              recipes = recipes.map((r, idx) => {
                const parsedTime = parseInt(r.time || r.cookTime || r.prepTime || 20, 10) || 20;
                const fullIngredientsList = r.ingredients || [];
                const stdCategory = standardizeCategory(r.category, r.title);
                return {
                  id: r.id || `recipe-${Date.now()}-${idx}`,
                  title: r.title,
                  type: stdCategory === 'Drinks' ? 'drink' : 'food',
                  category: stdCategory,
                  time: parsedTime,
                  ingredients: fullIngredientsList,
                  steps: r.steps || r.instructions || []
                };
              });

              console.log(`Live Gemini AI SDK (${modelName}, Key #${keyIdx + 1}) successfully returned ${recipes.length} recipes.`);

              // Cache the successful search result for resource distribution
              try {
                await AsyncStorage.setItem(cacheKey, JSON.stringify({
                  timestamp: Date.now(),
                  recipes
                }));
              } catch (e) {
                console.warn('Failed to save search cache:', e);
              }

              return { recipes, isFood: true, needsApiKey: false };
            }
          }
        } catch (err) {
          const errMsg = err?.message || String(err);
          console.warn(`Gemini Key #${keyIdx + 1} (${modelName}) failed/quota error:`, errMsg);

          // If quota reached (429 / resource exhausted), break model loop to try NEXT API key in the pool immediately!
          if (errMsg.includes('429') || errMsg.includes('Quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
            console.log(`Quota hit on Key #${keyIdx + 1}. Auto-rotating to next key in pool...`);
            break; 
          }
        }
      }
    }
  }

  // Fallback to Smart Recipe Engine if Gemini API is quota limited, key invalid, or offline
  console.log(`Using ChefStack Smart Culinary Engine fallback for: "${cleanQuery}"`);
  const fallbackRecipes = generateSmartRecipes(cleanQuery);
  return { 
    recipes: fallbackRecipes, 
    isFood: true, 
    needsApiKey: !isKeyValid,
    isFallback: true 
  };
};

export const saveCustomApiKey = async (key) => {
  if (key) {
    await AsyncStorage.setItem(CUSTOM_KEY_STORAGE, key.trim());
  } else {
    await AsyncStorage.removeItem(CUSTOM_KEY_STORAGE);
  }
};

export const getCustomApiKey = async () => {
  return await AsyncStorage.getItem(CUSTOM_KEY_STORAGE).catch(() => null);
};

// Static offline substitutions dictionary fallback
import offlineSubstitutions from '../data/substitutions.json';

/**
 * Finds ingredient substitutes dynamically via Gemini AI when online,
 * or falls back to static substitutions JSON when offline.
 */
export const findSubstitutes = async (ingredient) => {
  const query = (ingredient || '').trim().toLowerCase();
  if (!query) return { substitutes: [], isOffline: false };

  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  // Offline Fallback
  if (!isOnline) {
    let matchedKey = Object.keys(offlineSubstitutions).find(k => query.includes(k) || k.includes(query));
    const substitutes = matchedKey ? offlineSubstitutions[matchedKey] : [
      `Try equal parts of a similar ingredient (e.g. oil for butter, milk + acid for buttermilk).`
    ];
    return { substitutes, isOffline: true, matchedKey: matchedKey || query };
  }

  // Online Gemini Query
  let apiKey = await AsyncStorage.getItem(CUSTOM_KEY_STORAGE).catch(() => null);
  if (!apiKey || !apiKey.trim()) {
    apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  }

  if (!apiKey || !apiKey.trim()) {
    let matchedKey = Object.keys(offlineSubstitutions).find(k => query.includes(k) || k.includes(query));
    return {
      substitutes: matchedKey ? offlineSubstitutions[matchedKey] : ["No API Key available. Use equal ratio culinary substitutes."],
      isOffline: true
    };
  }

  const prompt = `List 3 to 5 culinary substitutes for "${ingredient}". Return strictly valid JSON array of strings, e.g. ["1 cup milk + 1 tbsp lemon juice", "1 cup plain yogurt"].`;

  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { response_mime_type: "application/json" }
        })
      });

      if (response.status === 200) {
        const data = await response.json();
        const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonText) {
          let clean = jsonText.trim().replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
          const parsed = JSON.parse(clean);
          const substitutes = Array.isArray(parsed) ? parsed : (parsed.substitutes || []);
          return { substitutes, isOffline: false };
        }
      }
    } catch (e) {}
  }

  // Fallback to static JSON if Gemini call fails
  let matchedKey = Object.keys(offlineSubstitutions).find(k => query.includes(k) || k.includes(query));
  return {
    substitutes: matchedKey ? offlineSubstitutions[matchedKey] : ["Fallback: Use equal ratio culinary substitutes."],
    isOffline: true
  };
};

/**
 * Performs a rule-based local search against stored recipes when offline.
 */
export const searchLocalRecipes = (recipes, query) => {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();
  
  return recipes.filter(recipe => {
    const titleMatch = recipe.title?.toLowerCase().includes(q);
    const categoryMatch = recipe.category?.toLowerCase().includes(q);
    const typeMatch = recipe.type?.toLowerCase().includes(q);
    const ingredientMatch = recipe.ingredients?.some(i => i.toLowerCase().includes(q));
    return titleMatch || categoryMatch || typeMatch || ingredientMatch;
  });
};

