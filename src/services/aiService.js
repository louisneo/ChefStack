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
  if (!apiKey) return { recipes: [], isFood: true };

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
            const result = JSON.parse(jsonText);
            const recipes = Array.isArray(result) ? result : (result.recipes || []);
            const isFood = result.is_food !== false; // Default to true if not specified
            return { recipes, isFood };
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

export const searchRecipes = async (query) => {
  // ... (previous logic stays same until mealdb)
  // 3. THEMEALDB FREE PUBLIC FALLBACK
  try {
    console.log(`Trying TheMealDB fallback...`);
    const mealDbUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`;
    const response = await fetch(mealDbUrl);
    if (response.status === 200) {
      const data = await response.json();
      if (data.meals && data.meals.length > 0) {
        console.log(`TheMealDB found results!`);
        const recipes = data.meals.slice(0, 5).map(meal => ({
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
  } catch (err) {}

  // ... (emergency and gibberish logic stays same)

const generatePrompt = (query) => `
  You are a ChefStack AI Assistant. Your task is to find and return at least 3 and up to 5 highly relevant food recipes for the query: "${query}".
  
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
