const getGeminiConfig = () => {
  const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  return {
    key,
    url: `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`
  };
};

/**
 * Searches for food recipes using Gemini AI
 * @param {string} query The user's search query
 * @returns {Promise<Array>} List of structured recipe objects
 */
export const searchRecipes = async (query) => {
  const { key, url } = getGeminiConfig();

  if (!key) {
    console.error('CRITICAL: Gemini API Key is UNDEFINED. Check your Vercel/Expo environment variables.');
    throw new Error('Gemini API Key is missing. If you are on Vercel, make sure you REDEPLOY after adding EXPO_PUBLIC_GEMINI_API_KEY to project settings.');
  }

  console.log('Gemini Search starting for:', query);
  console.log('API Key detected (first 4):', key.substring(0, 4) + '...');

  const prompt = `
    You are a ChefStack AI Assistant. Your task is to find and return exactly 3 highly relevant food recipes for the query: "${query}".
    
    RULES:
    1. ONLY return food recipes. If the query is not about food, return an empty array.
    2. Format the response as a VALID JSON array of objects.
    3. DO NOT include any text outside the JSON array.
    4. Each recipe object must have these exact keys:
       - "title": string (Recipe name)
       - "type": string (always "food")
       - "category": string (e.g., "Main Course (Ulam)", "Dessert", "Appetizer", "Breakfast")
       - "time": number (minutes to cook, e.g., 45)
       - "ingredients": array of strings (list of items with amounts)
       - "steps": array of strings (step-by-step instructions)
    
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

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: "gemini-1.5-flash", 
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    console.log('Gemini raw response status:', response.status);
    
    if (data.error) {
      console.error('Gemini API Error details:', data.error);
      throw new Error(data.error.message || 'Error calling Gemini API');
    }

    if (!data.choices || data.choices.length === 0) {
      console.error('Gemini returned no choices:', data);
      throw new Error('AI returned no results. Try being more specific.');
    }

    const jsonText = data.choices[0].message.content;
    console.log('Gemini parsed text:', jsonText);
    
    // The OpenAI response might contain markdown blocks, let's clean it just in case
    const cleanedJson = jsonText.replace(/```json|```/g, '').trim();
    const recipes = JSON.parse(cleanedJson);
    
    // If the AI returned an object with a recipes array, or just the array
    const finalArray = Array.isArray(recipes) ? recipes : (recipes.recipes || []);
    return finalArray;
  } catch (error) {
    console.error('AI Service Error:', error);
    throw error;
  }
};
