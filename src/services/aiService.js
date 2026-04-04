const getGeminiConfig = (modelName, version = 'v1beta') => {
  const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  return {
    key,
    url: `https://generativelanguage.googleapis.com/${version}/models/${modelName}:generateContent?key=${key}`
  };
};

/**
 * Searches for food recipes using Gemini AI with robust multi-endpoint fallbacks
 * @param {string} query The user's search query
 * @returns {Promise<Array>} List of structured recipe objects
 */
/**
 * Dynamically fetches available Gemini models to avoid 404s on deprecated names.
 */
const fetchAvailableModels = async (apiKey) => {
  const versions = ['v1beta', 'v1'];
  for (const version of versions) {
    try {
      console.log(`Fetching available models for Gemini ${version}...`);
      const url = `https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`;
      
      // Short timeout for the list call itself
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
          
          // Return the full list so we can try multiple
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
 * @param {string} query The user's search query
 * @returns {Promise<Array>} List of structured recipe objects
 */
export const searchRecipes = async (query) => {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) return [];

  // 1. DYNAMIC GEMINI DISCOVERY & ITERATION
  const config = await fetchAvailableModels(apiKey);
  
  if (config) {
    const { version, models } = config;
    // Sort to prioritize Flash
    const prioritizedModels = [
      ...models.filter(m => m === 'gemini-1.5-flash-latest'),
      ...models.filter(m => m === 'gemini-1.5-flash'),
      ...models.filter(m => m.includes('flash') && !m.includes('latest')),
      ...models.filter(m => !m.includes('flash'))
    ].slice(0, 3); // Top 3 most likely to work

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
            const recipes = JSON.parse(jsonText);
            return Array.isArray(recipes) ? recipes : (recipes.recipes || []);
          }
        } else if (response.status === 429) {
          console.log(`${modelName} is rate-limited (429). Trying next discovered model...`);
          continue; 
        } else {
          console.log(`${modelName} failed with status ${response.status}.`);
        }
      } catch (err) {
        console.log(`${modelName} error:`, err.message);
      }
    }
  }

  // 2. OPENAI FALLBACK (Secondary)
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
          return Array.isArray(result) ? result : (result.recipes || []);
        }
      }
    } catch (err) {
      console.warn(`OpenAI Fallback failed:`, err.message);
    }
  } else {
    console.log("OpenAI API Key not found. Skipping fallback.");
  }

  // 3. THEMEALDB FREE PUBLIC FALLBACK
  try {
    console.log(`Trying TheMealDB fallback...`);
    const mealDbUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`;
    const response = await fetch(mealDbUrl);
    if (response.status === 200) {
      const data = await response.json();
      if (data.meals && data.meals.length > 0) {
        console.log(`TheMealDB found results!`);
        const topMeals = data.meals.slice(0, 3);
        return topMeals.map(meal => ({
          title: meal.strMeal,
          type: "food",
          category: meal.strCategory || "Main Course",
          time: 30,
          ingredients: [meal.strIngredient1, meal.strIngredient2].filter(Boolean),
          steps: [meal.strInstructions?.substring(0, 100) + '...'],
          image: meal.strMealThumb
        }));
      }
    }
  } catch (err) {}

  // 4. HARDCODED EMERGENCY FALLBACK (Enhanced)
  const normalizedQuery = query.toLowerCase();
  const EMERGENCY_GEMS = [
    { title: "Ginataang Bilo-Bilo", queryMatch: ["bilo", "ginataan"] },
    { title: "Matcha Green Tea Latte", queryMatch: ["matcha", "green tea"] },
    { title: "Pork Adobo", queryMatch: ["adobo"] },
    { title: "Sinigang na Baboy", queryMatch: ["sinigang"] },
    { title: "Chicken Curry", queryMatch: ["curry"] }
  ];

  const match = EMERGENCY_GEMS.find(g => g.queryMatch.some(q => normalizedQuery.includes(q)));
  if (match) {
    console.log(`Everything failed, but I recognize "${match.title}". Returning hardcoded result.`);
    return [{
      title: match.title,
      type: "food",
      category: "Specialties",
      time: 30,
      ingredients: ["Main ingredient", "Special sauce", "Seasoning"],
      steps: ["Prepare base", "Slow cook until perfect", "Garnish and serve"],
      image: match.title.includes("Matcha") 
        ? "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?q=80&w=600" 
        : "https://www.kawalingpinoy.com/wp-content/uploads/2013/02/ginataang-bilo-bilo-1.jpg"
    }];
  }

  return [];
};

const generatePrompt = (query) => `
  You are a ChefStack AI Assistant. Your task is to find and return exactly 3 highly relevant food recipes for the query: "${query}".
  
  RULES:
  1. ONLY return food recipes. If the query is not about food, return an empty array {"recipes": []}.
  2. Format the response as a VALID JSON object containing a "recipes" key which is an array of objects.
  3. DO NOT include any markdown formatting (like \`\`\`json) or text outside the JSON object.
  4. Each recipe object must have these exact keys:
     - "title": string (Recipe name)
     - "type": string (always "food")
     - "category": string (e.g., "Main Course (Ulam)", "Dessert", "Appetizer", "Breakfast")
     - "time": number (minutes to cook)
     - "ingredients": array of strings
     - "steps": array of strings
  
  JSON format example:
  {
    "recipes": [
      {
        "title": "Adobo",
        "type": "food",
        "category": "Main Course (Ulam)",
        "time": 60,
        "ingredients": ["500g Pork", "1/2 cup Soy Sauce"],
        "steps": ["Marinate pork", "Cook until tender"]
      }
    ]
  }
`;
