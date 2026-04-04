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
export const searchRecipes = async (query) => {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Gemini API Key is missing.');
    return [];
  }

  // 1. GEMINI AI (Primary)
  // We try v1beta first (supports JSON mode natively) then v1 as backup
  const apiVersions = ['v1beta', 'v1'];
  const models = [
    'gemini-1.5-flash-latest', 
    'gemini-1.5-flash', 
    'gemini-1.5-flash-8b', // Highly available
    'gemini-1.5-pro-latest',
    'gemini-2.0-flash-exp'
  ];

  for (const version of apiVersions) {
    console.log(`Checking Gemini ${version} responsiveness...`);
    let versionIsOperational = true;

    for (const modelName of models) {
      if (!versionIsOperational) break;

      try {
        const { url } = getGeminiConfig(modelName, version);
        
        const requestBody = {
          contents: [{ parts: [{ text: generatePrompt(query) }] }],
        };

        if (version === 'v1beta') {
          requestBody.generationConfig = { response_mime_type: "application/json" };
        }
        
        // Add a 5-second timeout to avoid long hangs
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (response.status === 200) {
          const data = await response.json();
          if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            const jsonText = data.candidates[0].content.parts[0].text;
            const recipes = JSON.parse(jsonText);
            return Array.isArray(recipes) ? recipes : (recipes.recipes || []);
          }
        } else if (response.status === 404) {
          // If the model or endpoint is 404, the whole version/project config is likely invalid
          console.log(`Gemini ${version} returned 404. Skipping this endpoint.`);
          versionIsOperational = false;
          break; 
        } else {
          // Other error (429, 500, 400), try next model
          const errorData = await response.json().catch(() => ({}));
          console.log(`${modelName} (${version}) skipped: ${response.status}`);
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log(`${modelName} (${version}) timed out.`);
        } else {
          console.log(`${modelName} (${version}) connectivity issue.`);
        }
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
  }

  // 3. THEMEALDB FREE PUBLIC FALLBACK (Absolute Fail-safe)
  try {
    console.log(`Trying TheMealDB fallback...`);
    const mealDbUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`;
    const response = await fetch(mealDbUrl);
    if (response.status === 200) {
      const data = await response.json();
      if (data.meals && data.meals.length > 0) {
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
    console.warn(`TheMealDB Fallback failed:`, err.message);
  }

  // FINAL RECOURSE: Return empty array instead of throwing.
  // This allows the UI to show "No recipes found" rather than a crash error.
  console.log("All AI and fallback providers returned no results for query:", query);
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
