/**
 * ChefStack AI Recipe Finder Service
 * Supports Google Gemini API (gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-flash)
 * with robust local fallback database (Kinilaw, Adobo, Sinigang, Sisig, etc.) & TheMealDB API integration.
 */

const DYNAMIC_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro'
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generatePrompt = (query) => `
  You are a professional chef assistant for ChefStack. Generate a list of 6 to 12 authentic, detailed food recipes matching the query: "${query}".
  
  CRITICAL RULES:
  1. ONLY return real food or drink recipes.
  2. If query is gibberish or not food/drink related, return {"is_food": false, "recipes": []}.
  3. Respond strictly in raw JSON without any markdown code blocks or wrapper text.
  4. Each recipe must contain:
     - title (string)
     - type (always "food" or "drink")
     - category (string, e.g., "Filipino Specialty", "Seafood", "Dessert", "Pasta", "Beverage")
     - time (number in minutes)
     - ingredients (array of strings)
     - steps (array of strings)

  Format:
  {
    "is_food": true,
    "recipes": [
      {
        "title": "Classic Fish Kinilaw",
        "type": "food",
        "category": "Filipino Seafood",
        "time": 20,
        "ingredients": ["500g Fresh Tuna or Tanigue", "1 cup Coconut Vinegar", "1/2 cup Calamansi Juice", "1 Thumb-sized Ginger (minced)", "1 Red Onion (diced)", "2 Siling Labuyo (chopped)", "Cucumber & Salt to taste"],
        "steps": ["Cubed raw fresh fish into 1/2-inch pieces", "Wash fish briefly with vinegar and drain thoroughly", "In a large bowl, combine calamansi juice, minced ginger, red onions, and chili", "Add fish cubes and gently mix", "Season with salt and let marinate in fridge for 10-15 minutes before serving"]
      }
    ]
  }
`;

// Built-in offline & fallback recipe catalog for popular dishes
const FALLBACK_RECIPE_DATABASE = {
  kinilaw: [
    {
      title: "Classic Fish Kinilaw (Cebu Style)",
      type: "food",
      category: "Filipino Seafood",
      time: 20,
      ingredients: ["500g Fresh Yellowfin Tuna", "1 cup Cane/Coconut Vinegar", "1/2 cup Fresh Calamansi Juice", "1 Thumb Ginger (minced)", "1 Red Onion (diced)", "3 Siling Labuyo (chopped)", "Salt & Black Pepper"],
      steps: ["Slice fresh tuna into uniform 1/2 inch cubes", "Pour half of vinegar over fish, gently toss, and drain completely to sanitize", "In a glass bowl, mix remaining vinegar, calamansi juice, ginger, onions, and chili", "Toss fish in the citrus mix and chill in refrigerator for 15 minutes", "Garnish with fresh chili and serve cold"]
    },
    {
      title: "Kinilaw sa Gata (Fish Ceviche with Coconut Milk)",
      type: "food",
      category: "Filipino Specialty",
      time: 25,
      ingredients: ["500g Tanigue (Spanish Mackerel)", "1/2 cup Coconut Cream (Kakang Gata)", "1/2 cup Vinegar", "1/2 cup Calamansi Juice", "Cucumber (sliced)", "Ginger & Chilis"],
      steps: ["Wash cubed fish in vinegar and drain", "Combine calamansi juice, ginger, onions, and sliced cucumber", "Add fish and pour coconut cream over the mixture", "Mix gently until creamy and serve thoroughly chilled"]
    },
    {
      title: "Kinilaw na Hipon (Shrimp Ceviche)",
      type: "food",
      category: "Seafood",
      time: 15,
      ingredients: ["400g Fresh Small Shrimps (shelled)", "1 cup Sukang Iloco or Cane Vinegar", "1/4 cup Calamansi Juice", "Garlic, Ginger & Red Onion", "Chili Peppers"],
      steps: ["Clean and devein fresh shrimps", "Steep in vinegar for 10 minutes until opaque", "Drain excess vinegar and toss with calamansi juice, garlic, ginger, and chilis", "Serve cold with cucumber slices"]
    },
    {
      title: "Kinilaw na Pusit (Squid Kinilaw)",
      type: "food",
      category: "Seafood",
      time: 15,
      ingredients: ["400g Fresh Baby Squid", "1/2 cup Calamansi Juice", "1/2 cup Vinegar", "Ginger, Red Onion, Sili"],
      steps: ["Clean baby squid and blanch in boiling water for 30 seconds", "Immediately plunge into ice water and drain", "Slice into rings and marinate in calamansi juice, vinegar, ginger, and chili", "Serve chilled"]
    }
  ],
  adobo: [
    {
      title: "Classic Pork Belly Adobo",
      type: "food",
      category: "Filipino Specialty",
      time: 50,
      ingredients: ["1kg Pork Belly (cubed)", "1/2 cup Soy Sauce", "1/2 cup Vinegar", "1 head Garlic (crushed)", "2 Bay Leaves", "Whole Black Peppercorns"],
      steps: ["Marinate pork belly in soy sauce and garlic for 30 minutes", "In a heavy pot, brown pork on high heat", "Add bay leaves, peppercorns, and leftover marinade", "Simmer covered for 30 minutes until meat is tender", "Pour in vinegar without stirring and simmer uncovered for 10 minutes until sauce thickens"]
    },
    {
      title: "Chicken & Egg Adobo",
      type: "food",
      category: "Filipino Specialty",
      time: 40,
      ingredients: ["1kg Chicken Thighs/Drumsticks", "4 Hard-boiled Eggs", "1/2 cup Soy Sauce", "1/2 cup Vinegar", "Garlic & Bay Leaves"],
      steps: ["Brown chicken pieces in a hot skillet", "Add soy sauce, garlic, bay leaves, and water", "Simmer for 25 minutes", "Add hard-boiled eggs and vinegar, cooking until sauce coats the chicken"]
    },
    {
      title: "Adobong Sitaw with Pork",
      type: "food",
      category: "Vegetable Side",
      time: 25,
      ingredients: ["1 bunch Yardlong Beans (Sitaw)", "200g Pork Slices", "3 tbsp Soy Sauce", "2 tbsp Vinegar", "Garlic & Onion"],
      steps: ["Sauté garlic, onion, and pork until browned", "Add sitaw cut into 2-inch pieces", "Pour soy sauce and vinegar, cooking until beans are crisp-tender"]
    }
  ],
  sinigang: [
    {
      title: "Sinigang na Baboy (Pork Tamarind Soup)",
      type: "food",
      category: "Sour Soup",
      time: 60,
      ingredients: ["1kg Pork Ribs or Belly", "1 packet Sampaloc Mix or Fresh Tamarind", "1 bunch Kangkong", "Radish, Eggplant, Gabi, Tomatoes, Onion"],
      steps: ["Boil pork with onions and tomatoes until tender (approx. 45 mins)", "Add gabi (taro) and radish, cooking until soft", "Stir in tamarind souring agent", "Add eggplant and kangkong leaves, simmer for 2 minutes before serving hot"]
    },
    {
      title: "Sinigang na Hipon (Shrimp Sinigang)",
      type: "food",
      category: "Sour Soup",
      time: 25,
      ingredients: ["500g Large Shrimps", "1 Sampaloc Mix", "Kangkong, Radish, Tomatoes, Siling Haba"],
      steps: ["Bring water with tomatoes, onions, and radish to a boil", "Add tamarind mix and green chilis", "Add fresh shrimps and kangkong, simmering for 3 minutes until cooked"]
    }
  ],
  sisig: [
    {
      title: "Sizzling Kapampangan Pork Sisig",
      type: "food",
      category: "Filipino Specialty",
      time: 60,
      ingredients: ["1kg Pork Mask/Belly & Chicken Liver", "2 Red Onions (diced)", "5 Calamansi", "Siling Labuyo", "1 tbsp Mayonnaise (optional)", "Egg"],
      steps: ["Boil pork mask until tender, then char-grill until crispy", "Chop pork and cooked liver finely", "Sauté chopped onions and chilis, then fold in pork", "Season with calamansi juice, salt, and pepper", "Serve on a piping hot sizzling plate with a raw egg on top"]
    },
    {
      title: "Crispy Tofu Sisig",
      type: "food",
      category: "Vegetarian",
      time: 25,
      ingredients: ["4 blocks Hard Tofu (cubed)", "1 Red Onion", "2 tbsp Mayonnaise", "1 tbsp Soy Sauce", "Green Chilis", "Calamansi"],
      steps: ["Deep fry tofu cubes until golden and extra crispy", "Chop tofu finely and toss with onions, chilis, soy sauce, and mayo", "Serve hot with fresh calamansi"]
    }
  ],
  carbonara: [
    {
      title: "Classic Creamy Carbonara",
      type: "food",
      category: "Pasta",
      time: 25,
      ingredients: ["400g Spaghetti", "200g Bacon or Pancetta", "3 Egg Yolks", "1 cup Parmesan Cheese", "Heavy Cream", "Garlic"],
      steps: ["Cook pasta in salted water until al dente", "Crisp bacon in a skillet with minced garlic", "Whisk egg yolks, parmesan cheese, and cream together", "Toss hot drained pasta into bacon skillet off heat, quickly stirring in egg cream mixture"]
    }
  ],
  matcha: [
    {
      title: "Iced Matcha Green Tea Latte",
      type: "drink",
      category: "Beverage",
      time: 5,
      ingredients: ["2 tsp Ceremonial Grade Matcha", "1/4 cup Warm Water", "3/4 cup Whole/Oat Milk", "1 tbsp Honey or Maple Syrup", "Ice Cubes"],
      steps: ["Whisk matcha powder into warm water until frothy", "Fill a tall glass with ice cubes and milk", "Pour matcha mixture over milk and sweeten to taste"]
    }
  ]
};

export const searchRecipes = async (query) => {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  const cleanQuery = (query || '').trim().toLowerCase();

  if (!cleanQuery) return { recipes: [], isFood: true };

  // Heuristic gibberish check
  const isGibberish = /^[asdfghjklqwertyuiopzxcvbnm]+$/i.test(cleanQuery) && cleanQuery.length > 7 && !/[aeiou]/i.test(cleanQuery);
  if (isGibberish) {
    return { recipes: [], isFood: false };
  }

  // 1. TRY GEMINI API (Primary AI Engine)
  if (apiKey) {
    for (const modelName of DYNAMIC_MODELS) {
      try {
        console.log(`ChefStack AI: Querying ${modelName}...`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: generatePrompt(cleanQuery) }] }],
            generationConfig: { response_mime_type: "application/json" }
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.status === 200) {
          const data = await response.json();
          const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (jsonText) {
            const parsed = JSON.parse(jsonText);
            const recipes = Array.isArray(parsed) ? parsed : (parsed.recipes || []);
            const isFood = parsed.is_food !== false;
            if (recipes.length > 0) {
              console.log(`Gemini ${modelName} returned ${recipes.length} recipes.`);
              return { recipes, isFood };
            }
          }
        }
      } catch (err) {
        console.log(`Gemini ${modelName} call failed/skipped:`, err.message);
      }
    }
  }

  // 2. SMART LOCAL FALLBACK DATABASE (Instant guaranteed results for Kinilaw, Adobo, Sinigang, Sisig, etc.)
  for (const [key, recipes] of Object.entries(FALLBACK_RECIPE_DATABASE)) {
    if (cleanQuery.includes(key) || key.includes(cleanQuery)) {
      console.log(`Serving local fallback recipes for "${cleanQuery}" (${key})`);
      return { recipes, isFood: true };
    }
  }

  // 3. THEMEALDB API FALLBACK (Free Global Recipe Search API)
  try {
    console.log(`Querying TheMealDB API for "${cleanQuery}"...`);
    const mealDbUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(cleanQuery)}`;
    const response = await fetch(mealDbUrl);
    if (response.status === 200) {
      const data = await response.json();
      if (data.meals && data.meals.length > 0) {
        const recipes = data.meals.slice(0, 8).map(meal => ({
          title: meal.strMeal,
          type: "food",
          category: meal.strCategory || "Main Course",
          time: 30,
          ingredients: [
            meal.strIngredient1, meal.strIngredient2, meal.strIngredient3,
            meal.strIngredient4, meal.strIngredient5, meal.strIngredient6
          ].filter(Boolean),
          steps: meal.strInstructions ? meal.strInstructions.split('\r\n').filter(s => s.trim().length > 5).slice(0, 5) : ["Prepare ingredients", "Cook thoroughly and serve"],
          image: meal.strMealThumb
        }));
        return { recipes, isFood: true };
      }
    }
  } catch (err) {
    console.log("TheMealDB fallback failed.");
  }

  // Generic fallback if user typed a food query that didn't match external APIs
  return { 
    recipes: [
      {
        title: `Home-Style ${cleanQuery.charAt(0).toUpperCase() + cleanQuery.slice(1)}`,
        type: "food",
        category: "Custom Recipe",
        time: 30,
        ingredients: ["Main fresh ingredients", "Aromatics (Garlic, Onion)", "Seasoning to taste", "Cooking Oil"],
        steps: [
          `Prepare and clean fresh ingredients for ${cleanQuery}.`,
          "Sauté garlic and onions in a hot pan until fragrant.",
          "Add main ingredients and simmer with seasonings until perfectly cooked.",
          "Garnish and serve hot."
        ]
      }
    ], 
    isFood: true 
  };
};
