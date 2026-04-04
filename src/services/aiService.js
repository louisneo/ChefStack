const getGeminiConfig = (modelName, version = 'v1beta') => {
  const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  return {
    key,
    url: `https://generativelanguage.googleapis.com/${version}/models/${modelName}:generateContent?key=${key}`
  };
};

/**
 * Dynamically fetches available Gemini models to avoid 404s on deprecated names.
 */
const fetchAvailableModels = async (apiKey) => {
  const versions = ['v1beta', 'v1'];
  for (const version of versions) {
    try {
      console.log(`Fetching available models for Gemini ${version}...`);
      const url = `https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.status === 200) {
        const data = await response.json();
        const supportedModels = (data.models || [])
          .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
          .map(m => m.name.split('/').pop());
        
        if (supportedModels.length > 0) {
          console.log(`Found ${supportedModels.length} models for ${version}`);
          return { version, models: supportedModels };
        }
      }
    } catch (err) {
      console.log(`Gemini ${version} discovery failed:`, err.message);
    }
  }
  return null;
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Searches for food recipes using Gemini AI with Dynamic Model Discovery
 */
export const searchRecipes = async (query) => {
  console.log(`AI Search Service: v5.8 Active. Query: "${query}"`);
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) return { recipes: [], isFood: true };

  // 1. DYNAMIC GEMINI DISCOVERY & ITERATION
  const config = await fetchAvailableModels(apiKey);
  
  if (config) {
    const { version, models } = config;
    const prioritizedModels = [
      ...models.filter(m => m === 'gemini-1.5-flash-latest'),
      ...models.filter(m => m === 'gemini-1.5-flash'),
      ...models.filter(m => m.includes('flash') && !m.includes('latest')),
      ...models.filter(m => !m.includes('flash'))
    ].slice(0, 3);

    for (const modelName of prioritizedModels) {
      const backoffTimes = [2000, 4000]; // 2s, 4s backoff for 429
      let attempts = 0;

      while (attempts <= backoffTimes.length) {
        try {
          console.log(`Trying model: ${modelName} (${version}). Attempt ${attempts + 1}`);
          const url = `https://generativelanguage.googleapis.com/${version}/models/${modelName}:generateContent?key=${apiKey}`;
          const requestBody = {
            contents: [{ parts: [{ text: generatePrompt(query) }] }],
          };
          if (version === 'v1beta') {
            requestBody.generationConfig = { response_mime_type: "application/json" };
          }
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 20000);
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (response.status === 200) {
            const data = await response.json();
            const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (jsonText) {
              const result = JSON.parse(jsonText);
              const recipes = Array.isArray(result) ? result : (result.recipes || []);
              const isFood = result.is_food !== false;
              return { recipes, isFood };
            }
          } else if (response.status === 429) {
            if (attempts < backoffTimes.length) {
              const waitMs = backoffTimes[attempts];
              console.log(`${modelName} is rate-limited (429). Retrying in ${waitMs/1000}s...`);
              await delay(waitMs);
              attempts++;
              continue;
            } else {
              console.log(`${modelName} max retries hit for 429.`);
              break; // Try next model or fallback
            }
          } else {
            console.log(`${modelName} failure (status ${response.status}). Trying next model.`);
            break;
          }
        } catch (err) {
          console.log(`${modelName} error:`, err.message);
          break;
        }
      }
    }
  }

  // 2. OPENAI FALLBACK (If Gemini failed or was skipped)
  const openaiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (openaiKey) {
    try {
      console.log(`Trying OpenAI fallback...`);
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: "system", content: "You are a ChefStack AI Assistant." },
            { role: "user", content: generatePrompt(query) }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (response.status === 200) {
        const data = await response.json();
        const jsonText = data.choices?.[0]?.message?.content;
        if (jsonText) {
          const result = JSON.parse(jsonText);
          const recipes = Array.isArray(result) ? result : (result.recipes || []);
          const isFood = result.is_food !== false;
          return { recipes, isFood };
        }
      }
    } catch (err) {
      console.warn(`OpenAI Fallback failed:`, err.message);
    }
  }

  // 3. EMERGENCY VARIATIONS (Prioritized for core terms if AI fails)
  const normalizedQuery = query.toLowerCase();
  
  // Whitelist of ~50 popular food/drink terms to bypass "Busy AI" error
  const COMMON_TERMS = [
    // Filipino
    'adobo', 'sinigang', 'sisig', 'bicol express', 'pancit', 'lumpia', 'menudo', 'caldereta', 
    'tinola', 'kare-kare', 'pinakbet', 'bulalo', 'halo-halo', 'lechon', 'humba', 'bagoong', 
    'tocino', 'longganisa', 'tapa', 'lugaw', 'champorado', 'bibingka', 'puto', 'ensaymada', 
    'pandesal', 'leche flan', 'dinuguan', 'afritada', 'mechado', 'tapsilog',
    // International
    'pizza', 'burger', 'pasta', 'sushi', 'ramen', 'taco', 'burrito', 'salad', 'steak', 
    'chicken', 'fries', 'sandwich', 'soup', 'curry', 'pancake', 'waffle', 'omelette', 
    'coffee', 'tea', 'juice', 'smoothie', 'matcha', 'latte', 'espresso', 'capuccino',
    'chocolate', 'cake', 'cookie', 'ice cream', 'donut', 'muffin'
  ];

  const isCommonTerm = COMMON_TERMS.some(term => normalizedQuery.includes(term));

  if (!isCommonTerm) {
    // If it's not a core demo/common term and AI is busy, return the user-requested error
    return { 
      error: "The AI is currently too busy. Please try again in a minute.", 
      recipes: [], 
      isFood: true 
    };
  }
  
  // High-variety variations for core culinary terms during AI downtime
  if (normalizedQuery.includes('adobo')) {
    console.log("Serving high-variety Adobo emergency fallback.");
    const adoboVariations = [
      { title: "Classic Pork Adobo", category: "Filipino Specialty", image: "https://www.kawalingpinoy.com/wp-content/uploads/2013/02/pork-adobo-3.jpg", time: 45, ingredients: ["Pork Belly", "Soy Sauce", "Vinegar", "Garlic"], steps: ["Sauté garlic", "Brown pork", "Simmer with soy sauce and vinegar"] },
      { title: "Savory Chicken Adobo", category: "Filipino Specialty", image: "https://www.kawalingpinoy.com/wp-content/uploads/2013/11/adobo-with-liver-spread-1.jpg", time: 40, ingredients: ["Chicken Thighs", "Soy Sauce", "Vinegar", "Peppercorns"], steps: ["Marinate chicken", "Simmer until tender", "Garnish with garlic chips"] },
      { title: "Eggplant Adobo (Pinoy Style)", category: "Vegetarian", image: "https://www.kawalingpinoy.com/wp-content/uploads/2018/06/adobong-talong-4.jpg", time: 25, ingredients: ["Eggplant", "Soy Sauce", "Vinegar", "Chili"], steps: ["Fry eggplant", "Sauté aromatics", "Simmer briefly"] },
      { title: "Adobong Pusit (Squid Adobo)", category: "Seafood", image: "https://www.kawalingpinoy.com/wp-content/uploads/2013/05/adobong-pusit-1.jpg", time: 30, ingredients: ["Fresh Squid", "Ink", "Soy Sauce", "Vinegar"], steps: ["Clean squid", "Sauté with ink", "Avoid overcooking"] },
      { title: "Adobong Sitaw (Yardlong Beans)", category: "Vegetable Side", image: "https://www.kawalingpinoy.com/wp-content/uploads/2013/04/adobong-sitaw-with-pork-1.jpg", time: 20, ingredients: ["Yardlong Beans", "Pork Bits", "Soy Sauce"], steps: ["Sauté pork", "Add beans", "Simmer until crisp-tender"] },
      { title: "Adobong Pula (Red Adobo)", category: "Regional Variety", image: "https://www.kawalingpinoy.com/wp-content/uploads/2019/07/adobo-sa-pula-4.jpg", time: 50, ingredients: ["Pork", "Annatto Seeds", "Vinegar"], steps: ["Cook with annatto", "Slow simmer", "No soy sauce version"] },
      { title: "Creamy Adobo sa Gata", category: "Bicolano Style", image: "https://www.kawalingpinoy.com/wp-content/uploads/2013/11/adobo-sa-gata-1.jpg", time: 45, ingredients: ["Chicken/Pork", "Coconut Milk", "Chili"], steps: ["Prepare regular adobo", "Stir in coconut milk", "Add spice"] },
      { title: "Beef Adobo (Batangas Style)", category: "Hearty Main", image: "https://www.kawalingpinoy.com/wp-content/uploads/2019/08/beef-adobo-3.jpg", time: 90, ingredients: ["Beef Brisket", "Soy Sauce", "Vinegar", "Star Anise"], steps: ["Slow cook beef", "Reduce sauce", "Serve with rice"] }
    ];
    return { recipes: adoboVariations, isFood: true };
  }

  // Variations for 'Bicol Express'
  if (normalizedQuery.includes('bicol express')) {
    const bicolVariations = [
      { title: "Classic Bicol Express", category: "Filipino Specialty", image: "https://www.kawalingpinoy.com/wp-content/uploads/2013/05/pork-bicol-express-2.jpg", time: 40, ingredients: ["Pork Belly", "Coconut Milk", "Bagoong", "Chili"], steps: ["Sauté aromatics", "Add pork and bagoong", "Simmer in coconut milk", "Add lots of chili"] },
      { title: "Chicken Bicol Express", category: "Filipino Specialty", image: "https://www.kawalingpinoy.com/wp-content/uploads/2013/10/chicken-bicol-express-1.jpg", time: 35, ingredients: ["Chicken Thighs", "Coconut Milk", "Chili"], steps: ["Brown chicken", "Simmer with spices", "Finish with thick cream"] },
      { title: "Vegan Bicol Express (Jackfruit)", category: "Vegetarian", image: "https://www.kawalingpinoy.com/wp-content/uploads/2018/11/ginataang-langka-with-pork-1.jpg", time: 30, ingredients: ["Young Jackfruit", "Coconut Milk", "Miso", "Chili"], steps: ["Stew jackfruit", "Add spicy coconut base"] },
      { title: "Seafood Bicol Express", category: "Seafood", image: "https://www.kawalingpinoy.com/wp-content/uploads/2013/11/ginataang-pusit-1.jpg", time: 25, ingredients: ["Shrimp/Squid", "Coconut Milk", "Bagoong", "Chili"], steps: ["Quick sauté seafood", "Simmer briefly in sauce"] }
    ];
    return { recipes: bicolVariations, isFood: true };
  }

  // Variations for 'Sisig'
  if (normalizedQuery.includes('sisig')) {
    const sisigVariations = [
      { title: "Authentic Pork Sisig", category: "Kapampangan Classic", image: "https://www.kawalingpinoy.com/wp-content/uploads/2015/12/authentic-pork-sisig-4.jpg", time: 60, ingredients: ["Pork Mask", "Liver", "Calamansi", "Onions"], steps: ["Boil and grill pork", "Chop finely", "Sauté with aromatics", "Serve on hot plate"] },
      { title: "Crispy Sizzling Sisig", category: "Bar Favorite", image: "https://www.kawalingpinoy.com/wp-content/uploads/2015/12/authentic-pork-sisig-4.jpg", time: 45, ingredients: ["Crispy Lechon Kawali", "Mayo", "Egg"], steps: ["Chop lechon", "Sauté until extra crispy", "Add mayo and egg"] },
      { title: "Chicken Sisig", category: "Healthier Option", image: "https://www.kawalingpinoy.com/wp-content/uploads/2021/04/chicken-sisig-1.jpg", time: 30, ingredients: ["Grilled Chicken", "Calamansi", "Onions"], steps: ["Grill chicken", "Dice and sauté", "Season with calamansi"] },
      { title: "Tofu Sisig", category: "Vegetarian", image: "https://www.kawalingpinoy.com/wp-content/uploads/2018/06/tofu-sisig-4.jpg", time: 20, ingredients: ["Hard Tofu", "Mayo", "Chili"], steps: ["Deep fry tofu cubes", "Toss in creamy sauce", "Serve sizzling"] }
    ];
    return { recipes: sisigVariations, isFood: true };
  }

  // Variations for 'Matcha'
  if (normalizedQuery.includes('matcha')) {
    const matchaVariations = [
      { title: "Matcha Green Tea Latte", category: "Drink", image: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?q=80&w=600", time: 5, ingredients: ["Matcha powder", "Milk", "Honey"], steps: ["Whisk matcha", "Froth milk", "Combine and sweeten"] },
      { title: "Matcha Iced Latte", category: "Cold Drink", image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600", time: 5, ingredients: ["Matcha", "Ice", "Almond Milk"], steps: ["Shake ingredients", "Pour over ice"] },
      { title: "Matcha Pancake Stack", category: "Breakfast", image: "https://images.unsplash.com/photo-1506084868730-3423e9339e05?q=80&w=600", time: 20, ingredients: ["Matcha", "Flour", "Eggs", "Milk"], steps: ["Mix batter", "Flip on griddle", "Top with honey"] },
      { title: "Matcha Green Tea Cookie", category: "Dessert", image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=600", time: 15, ingredients: ["Matcha", "Butter", "Sugar", "White Chocolate"], steps: ["Cream butter", "Add matcha", "Bake 10 mins"] },
      { title: "Matcha Smoothie Bowl", category: "Health", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600", time: 10, ingredients: ["Matcha", "Banana", "Spinach", "Toppings"], steps: ["Blend base", "Add fruit toppings", "Sprinkle nuts"] }
    ];
    return { recipes: matchaVariations, isFood: true };
  }

  // Variations for 'Sinigang'
  if (normalizedQuery.includes('sinigang')) {
    const sinigangVariations = [
      { title: "Sinigang na Baboy (Pork)", category: "Sour Soup", image: "https://www.kawalingpinoy.com/wp-content/uploads/2013/01/pork-sinigang-6.jpg", time: 60, ingredients: ["Pork Belly", "Tamarind", "Kangkong", "Radish"], steps: ["Boil pork", "Add tamarind", "Simmer vegetables"] },
      { title: "Sinigang na Hipon (Shrimp)", category: "Sour Soup", image: "https://www.kawalingpinoy.com/wp-content/uploads/2013/05/sinigang-na-hipon-2.jpg", time: 20, ingredients: ["Shrimp", "Tamarind", "Siling Haba"], steps: ["Boil broth", "Quick cook shrimp", "Add veggies"] },
      { title: "Sinigang na Isda (Fish)", category: "Sour Soup", image: "https://www.kawalingpinoy.com/wp-content/uploads/2013/10/sinigang-na-bangus-sa-bayabas-1.jpg", time: 30, ingredients: ["Bangus", "Guava/Tamarind", "Miso"], steps: ["Prepare sour base", "Poach fish", "Simmer greens"] },
      { title: "Sinigang na Baka (Beef)", category: "Sour Soup", image: "https://www.kawalingpinoy.com/wp-content/uploads/2019/04/sinigang-na-baka-sa-kamias-1.jpg", time: 90, ingredients: ["Beef Short Ribs", "Kamias", "Okra"], steps: ["Slow boil beef", "Add souring agent", "Season to taste"] }
    ];
    return { recipes: sinigangVariations, isFood: true };
  }

  // 4. THEMEALDB FALLBACK
  try {
    console.log(`Trying TheMealDB fallback...`);
    const mealDbUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`;
    const response = await fetch(mealDbUrl);
    if (response.status === 200) {
      const data = await response.json();
      if (data.meals && data.meals.length > 0) {
        // Return all results from TheMealDB for maximum variety
        const recipes = data.meals.map(meal => ({
          title: meal.strMeal,
          type: "food",
          category: meal.strCategory || "Main Course",
          time: 30,
          ingredients: [meal.strIngredient1, meal.strIngredient2].filter(Boolean),
          steps: [meal.strInstructions?.substring(0, 100) + '...'],
          image: meal.strMealThumb
        }));
        return { recipes, isFood: true };
      }
    }
  } catch (err) {
    console.log("TheMealDB Fallback failed.");
  }

  const EMERGENCY_GEMS = [
    { title: "Ginataang Bilo-Bilo", queryMatch: ["bilo", "ginataan"] },
    { title: "Matcha Green Tea Latte", queryMatch: ["matcha", "green tea"] },
    { title: "Pork Adobo", queryMatch: ["adobo"] }, // Should be handled by above but kept for safety
    { title: "Sinigang na Baboy", queryMatch: ["sinigang"] },
    { title: "Chicken Curry", queryMatch: ["curry"] }
  ];

  const match = EMERGENCY_GEMS.find(g => g.queryMatch.some(q => normalizedQuery.includes(q)));
  if (match) {
    return {
      recipes: [{
        title: match.title,
        type: "food",
        category: "Specialties",
        time: 30,
        ingredients: ["Main ingredient", "Special sauce", "Seasoning"],
        steps: ["Prepare base", "Slow cook until perfect", "Garnish and serve"],
        image: match.title.includes("Matcha") 
          ? "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?q=80&w=600" 
          : "https://www.kawalingpinoy.com/wp-content/uploads/2013/02/ginataang-bilo-bilo-1.jpg"
      }],
      isFood: true
    };
  }

  // Enhanced Gibberish & Non-Food Heuristics
  const hasVowels = /[aeiouy]/i.test(normalizedQuery);
  const isTooLongWithNoSpaces = normalizedQuery.length > 10 && !normalizedQuery.includes(' ');
  const isMashing = /^[asdfghjkl]+$/.test(normalizedQuery) || /^[qwertyuiop]+$/.test(normalizedQuery);
  const isProbablyGibberish = !hasVowels || isTooLongWithNoSpaces || isMashing || normalizedQuery.length < 3;

  return { recipes: [], isFood: !isProbablyGibberish };
};

const generatePrompt = (query) => `
  You are a ChefStack AI Assistant. Your task is to find and return at least 12 and up to 20 highly relevant, distinct, and varied food recipes for the query: "${query}". 
  Provide as many regional and ingredient-based variations as possible (e.g. for "Adobo", you MUST include Pork Adobo, Chicken Adobo, Squid Adobo, Eggplant Adobo, Adobong Sitaw, and Beef Adobo).
  
  CRITICAL RULES:
  1. ONLY return food or drink recipes. 
  2. If the query is GIBBERISH (like "asdasd" or "ughuui..."), NONSENSE, or NOT about food/drinks, return: {"is_food": false, "recipes": []}.
  3. DO NOT hallucinate. If you don't know a real recipe for the query, return {"is_food": true, "recipes": []}.
  4. Format the response as a VALID JSON object containing a "recipes" key (array) and an "is_food" key (boolean).
  5. DO NOT include any markdown formatting (like \`\`\`json) or text outside the JSON object.
  6. Each recipe object must have: title, type (always "food"), category, time (number), ingredients (array), steps (array).
  
  JSON format:
  {
    "is_food": true,
    "recipes": [
      {
        "title": "Adobo",
        "type": "food",
        "category": "Main Course (Ulam)",
        "time": 60,
        "ingredients": ["Pork", "Soy Sauce"],
        "steps": ["Step 1", "Step 2"]
      }
    ]
  }
`;
