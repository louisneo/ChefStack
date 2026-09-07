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

  // Check for custom key in storage first, then env
  let apiKey = await AsyncStorage.getItem(CUSTOM_KEY_STORAGE).catch(() => null);
  if (!apiKey || !apiKey.trim()) {
    apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  }

  if (!apiKey || !apiKey.trim()) {
    return {
      error: "Missing Google Gemini API Key. Please enter a valid API key from Google AI Studio.",
      recipes: [],
      isFood: true,
      needsApiKey: true
    };
  }

  const prompt = `
    You are an expert AI chef assistant for ChefStack. Search for and generate a comprehensive list of 6 to 12 authentic, highly detailed food/drink recipes for: "${cleanQuery}".
    
    RULES:
    1. ONLY return food or drink recipes. If query is non-food/gibberish, set "is_food": false and "recipes": [].
    2. Format the response strictly as valid JSON without any markdown formatting or commentary.
    3. Each recipe object must include:
       - title (string)
       - type ("food" or "drink")
       - category (string)
       - time (number in minutes)
       - ingredients (array of strings)
       - steps (array of strings)

    Format:
    {
      "is_food": true,
      "recipes": [
        {
          "title": "Recipe Title",
          "type": "food",
          "category": "Main Course",
          "time": 30,
          "ingredients": ["Ingredient 1", "Ingredient 2"],
          "steps": ["Step 1", "Step 2"]
        }
      ]
    }
  `;

  let lastErrorMessage = '';

  for (const model of GEMINI_MODELS) {
    try {
      console.log(`Querying Live Gemini AI model: ${model}...`);
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

          console.log(`Live Gemini AI successfully returned ${recipes.length} recipes.`);
          return { recipes, isFood, needsApiKey: false };
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        console.warn(`Gemini AI (${model}) Error status ${response.status}:`, errData);
        
        if (response.status === 400 && errData.error?.message?.includes('API key not valid')) {
          return {
            error: "Your Google Gemini API Key is invalid or expired. Please update your API key.",
            recipes: [],
            isFood: true,
            needsApiKey: true
          };
        }
        
        lastErrorMessage = errData.error?.message || `HTTP ${response.status} from Gemini AI.`;
      }
    } catch (err) {
      console.warn(`Gemini model ${model} fetch exception:`, err.message);
      lastErrorMessage = err.message;
    }
  }

  return {
    error: lastErrorMessage ? `AI Search Error: ${lastErrorMessage}` : "Unable to contact Gemini AI. Please check your internet or API key.",
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
