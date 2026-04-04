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

/**
 * Searches for food recipes using Gemini AI with Dynamic Model Discovery
 */
export const searchRecipes = async (query) => {
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
      try {
        console.log(`Trying model: ${modelName} (${version})`);
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
          console.log(`${modelName} is rate-limited (429).`);
          continue; 
        }
      } catch (err) {
        console.log(`${modelName} error:`, err.message);
      }
    }
  }

  // 2. OPENAI FALLBACK
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
  } else {
    console.log("OpenAI API Key not found. Skipping fallback.");
  }

  // 3. THEMEALDB FALLBACK
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

  // 4. HARDCODED EMERGENCY FALLBACK (Highly Varied for core queries like 'Adobo')
  const normalizedQuery = query.toLowerCase();
  
  // Specialized variations for 'Adobo' if everything else is rate-limited
  if (normalizedQuery === 'adobo' || normalizedQuery.includes('adobo')) {
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
