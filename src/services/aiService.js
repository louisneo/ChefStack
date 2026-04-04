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
          
          // Selection Strategy:
          // 1. Prefer stable 1.5-flash-latest
          // 2. Fallback to 1.5-flash
          // 3. Fallback to any 1.5 variant
          // 4. Fallback to 2.0-flash-exp (good for experimental)
          // 5. Fallback to anything with "flash"
          // 6. First available
          const preferred = 
            supportedModels.find(m => m === 'gemini-1.5-flash-latest') || 
            supportedModels.find(m => m === 'gemini-1.5-flash') || 
            supportedModels.find(m => m.includes('1.5-flash')) || 
            supportedModels.find(m => m.includes('2.0-flash')) || 
            supportedModels.find(m => m.includes('flash')) || 
            supportedModels[0];
            
          return { version, modelName: preferred };
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

  // 1. DYNAMIC GEMINI DISCOVERY
  const config = await fetchAvailableModels(apiKey);
  
  if (config) {
    try {
      const { version, modelName } = config;
      console.log(`Using dynamically discovered model: ${modelName} (${version})`);
      
      const url = `https://generativelanguage.googleapis.com/${version}/models/${modelName}:generateContent?key=${apiKey}`;
      const requestBody = {
        contents: [{ parts: [{ text: generatePrompt(query) }] }],
      };

      if (version === 'v1beta') {
        requestBody.generationConfig = { response_mime_type: "application/json" };
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout for generation

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
      } else {
        console.log(`Dynamic model ${modelName} failed with status ${response.status}`);
      }
    } catch (err) {
      console.log(`Gemini dynamic request failed:`, err.message);
    }
  } else {
    console.log("No available Gemini models found for this key/project.");
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
  }

  // 3. THEMEALDB FREE PUBLIC FALLBACK (Absolute Fail-safe)
  try {
    console.log(`Trying TheMealDB fallback for "${query}"...`);
    const mealDbUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`;
    const response = await fetch(mealDbUrl);
    if (response.status === 200) {
      const data = await response.json();
      if (data.meals && data.meals.length > 0) {
        console.log(`TheMealDB found ${data.meals.length} recipes! Returning results.`);
        const topMeals = data.meals.slice(0, 3);
        return topMeals.map(meal => {
          const ingredients = [];
          for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            if (ingredient && ingredient.trim() !== '') {
              ingredients.push(`${measure ? measure.trim() + ' ' : ''}${ingredient.trim()}`);
            }
          }
          const steps = meal.strInstructions?.split(/(?:\r\n|\r|\n)+/)
            .filter(step => step.trim().length > 0)
            .slice(0, 8) || ["Instructions unknown"];

          return {
            title: meal.strMeal,
            type: "food",
            category: meal.strCategory || "Main Course",
            time: 30,
            ingredients: ingredients.length > 0 ? ingredients : ["Ingredients unknown"],
            steps: steps,
            image: meal.strMealThumb
          };
        });
      }
    }
  } catch (err) {
    console.log(`TheMealDB Fallback failed for "${query}".`);
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
