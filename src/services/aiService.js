import AsyncStorage from '@react-native-async-storage/async-storage';

const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro'
];

const CUSTOM_KEY_STORAGE = '@chefstack_gemini_api_key';

/**
 * Searches for recipes exclusively using live Google Gemini AI.
 */
export const searchRecipes = async (query) => {
  const cleanQuery = (query || '').trim();
  if (!cleanQuery) return { recipes: [], isFood: true };

  // Check custom key in local storage first, then environment variable
  let apiKey = await AsyncStorage.getItem(CUSTOM_KEY_STORAGE).catch(() => null);
  if (!apiKey || !apiKey.trim()) {
    apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  }

  if (!apiKey || !apiKey.trim()) {
    return {
      error: "Google Gemini API Key is missing. Please click the key icon (🔑) above to add your key from Google AI Studio.",
      recipes: [],
      isFood: true,
      needsApiKey: true
    };
  }

  const prompt = `
    You are an expert AI culinary chef. Generate a comprehensive list of 6 to 12 authentic, detailed food or drink recipes for: "${cleanQuery}".
    
    STRICT REQUIREMENTS:
    1. ONLY return food or drink recipes matching the query. If the query is not food/drink related or is gibberish, return {"is_food": false, "recipes": []}.
    2. Format the response strictly as valid JSON with NO markdown blocks (\`\`\`json) or extra text.
    3. Each recipe object in the "recipes" array must have:
       - title (string)
       - type ("food" or "drink")
       - category (string)
       - time (number in minutes)
       - ingredients (array of strings)
       - steps (array of strings)

    JSON Structure:
    {
      "is_food": true,
      "recipes": [
        {
          "title": "Classic Beef Steak",
          "type": "food",
          "category": "Main Course",
          "time": 30,
          "ingredients": ["500g Ribeye Steak", "2 tbsp Butter", "3 cloves Garlic", "Fresh Rosemary", "Salt & Black Pepper"],
          "steps": ["Season steak generously with salt and pepper.", "Sear in a hot skillet for 3-4 minutes per side.", "Baste with butter, garlic, and rosemary.", "Rest for 5 minutes before slicing and serving."]
        }
      ]
    }
  `;

  let lastErrorDetail = '';
  let apiKeyInvalid = false;

  for (const model of GEMINI_MODELS) {
    try {
      console.log(`ChefStack AI: Querying live model ${model}...`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { response_mime_type: "application/json" }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.status === 200) {
        const data = await response.json();
        const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (jsonText) {
          let cleanJson = jsonText.trim();
          if (cleanJson.startsWith('```json')) {
            cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '').trim();
          } else if (cleanJson.startsWith('```')) {
            cleanJson = cleanJson.replace(/^```/, '').replace(/```$/, '').trim();
          }

          const parsed = JSON.parse(cleanJson);
          const recipes = Array.isArray(parsed) ? parsed : (parsed.recipes || []);
          const isFood = parsed.is_food !== false;

          console.log(`Live Gemini AI (${model}) successfully returned ${recipes.length} recipes.`);
          return { recipes, isFood, needsApiKey: false };
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        console.warn(`Gemini AI (${model}) status ${response.status}:`, errData);

        if (response.status === 400 && errData.error?.reason === 'API_KEY_INVALID') {
          apiKeyInvalid = true;
          break;
        }
        
        lastErrorDetail = errData.error?.message || `Status ${response.status}`;
      }
    } catch (err) {
      console.warn(`Gemini AI (${model}) exception:`, err.message);
      lastErrorDetail = err.message;
    }
  }

  if (apiKeyInvalid) {
    return {
      error: "Google rejected this API Key (API_KEY_INVALID). Please open Google AI Studio (aistudio.google.com), click '+ Create API key in NEW project', and paste the new key here.",
      recipes: [],
      isFood: true,
      needsApiKey: true
    };
  }

  return {
    error: lastErrorDetail ? `AI Error: ${lastErrorDetail}` : "Unable to reach Gemini AI service. Please check your internet connection.",
    recipes: [],
    isFood: true,
    needsApiKey: false
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
