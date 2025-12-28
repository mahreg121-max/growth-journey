
import { GoogleGenAI, Type } from "@google/genai";

// Always use the correct named parameter initialization
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getDailyWisdom = async () => {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `
    Provide one grounding and inspiring quote for a life tracker app. 
    The quote should be inspired by African or Egyptian wisdom, or general stoic philosophy.
    Keep it short and impactful.
    Return only a JSON object with "quote" and "author".
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quote: { type: Type.STRING },
            author: { type: Type.STRING }
          },
          required: ["quote", "author"]
        }
      }
    });

    // Handle potential undefined text property
    const text = response.text;
    return text ? JSON.parse(text) : {
      quote: "Knowing that you do not know is the best. Not knowing that you do not know is a flaw.",
      author: "Ancient Proverb"
    };
  } catch (error) {
    console.error("AI Quote Error:", error);
    return {
      quote: "Knowing that you do not know is the best. Not knowing that you do not know is a flaw.",
      author: "Ancient Proverb"
    };
  }
};
