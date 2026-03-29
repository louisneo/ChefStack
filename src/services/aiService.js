const getGeminiConfig = (modelName) => {
  const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  return {
    key,
    url: `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`
  };
};

/**
 * Searches for food recipes using Gemini AI
 * @param {string} query The user's search query
 * @returns {Promise<Array>} List of structured recipe objects
 */
export const searchRecipes = async (query) => {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API Key is missing. Check your Vercel project settings.');
  }

  // List of models to try in order of preference (Updated for March 2026)
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-3.1-flash-lite', 'gemini-pro'];
  let lastError = null;

  for (const modelName of models) {
    try {
      console.log(`Trying AI model: ${modelName}...`);
      const { url } = getGeminiConfig(modelName);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: generatePrompt(query) }] }],
          generationConfig: { response_mime_type: "application/json" }
        }),
      });

      const data = await response.json();
      console.log(`Response from ${modelName}:`, response.status);

      if (response.status === 200 && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        const jsonText = data.candidates[0].content.parts[0].text;
        const recipes = JSON.parse(jsonText);
        return Array.isArray(recipes) ? recipes : (recipes.recipes || []);
      }

      if (data.error) {
        console.warn(`Model ${modelName} failed:`, data.error.message);
        lastError = data.error.message;
      }
    } catch (err) {
      console.warn(`Error with ${modelName}:`, err.message);
      lastError = err.message;
    }
  }

  throw new Error(lastError || 'All AI models failed. Please check your API key or quota in Google AI Studio.');
};

const generatePrompt = (query) => `
  You are a ChefStack AI Assistant. Your task is to find and return exactly 3 highly relevant food recipes for the query: "${query}".
  
  RULES:
  1. ONLY return food recipes. If the query is not about food, return an empty array.
  2. Format the response as a VALID JSON array of objects.
  3. DO NOT include any text outside the JSON array.
  4. Each recipe object must have these exact keys:
     - "title": string (Recipe name)
     - "type": string (always "food")
     - "category": string (e.g., "Main Course (Ulam)", "Dessert", "Appetizer", "Breakfast")
     - "time": number (minutes to cook)
     - "ingredients": array of strings
     - "steps": array of strings
  
  JSON format example:
  [
    {
      "title": "Adobo",
      "type": "food",
      "category": "Main Course (Ulam)",
      "time": 60,
      "ingredients": ["500g Pork", "1/2 cup Soy Sauce"],
      "steps": ["Marinate pork", "Cook until tender"]
    }
  ]
`;
