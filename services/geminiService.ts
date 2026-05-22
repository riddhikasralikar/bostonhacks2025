import { GoogleGenAI, Type } from "@google/genai";
import type { Trend } from '../types';

// Add fallback for API key
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  console.error("VITE_GEMINI_API_KEY is missing from environment variables");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

const trendSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      trendName: {
        type: Type.STRING,
        description: "A catchy name for the identified fashion trend."
      },
      description: {
        type: Type.STRING,
        description: "A 2-3 sentence description of the trend, its key elements, and why it's emerging."
      },
      recommendations: {
        type: Type.ARRAY,
        description: "A list of 3 specific but generic product types that fit this trend (e.g., 'High-waisted wide-leg jeans', 'Chunky sole loafers').",
        items: {
          type: Type.STRING,
        },
      },
    },
    required: ["trendName", "description", "recommendations"],
  },
};

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
};

export const predictTrendsFromImages = async (
  images: { base64: string; mimeType: string }[]
): Promise<Trend[]> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY is not set in environment variables.");
  }
  
  if (images.length === 0) {
    throw new Error("At least one image is required to predict trends.");
  }

  const imageParts = images.map(img => fileToGenerativePart(img.base64, img.mimeType));

  const prompt = `You are an expert fashion trend forecaster. Analyze the provided images from a user's style inspiration board. Identify 4 key emerging fashion trends based on the items, aesthetics, colors, and silhouettes in these images. For each trend, provide a name, a short description, and 3 product recommendations. Return the response as a JSON object that adheres to the provided schema.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: {
        parts: [
          ...imageParts,
          { text: prompt }
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: trendSchema,
      },
    });

    const jsonText = response.text.trim();
    const trends: Trend[] = JSON.parse(jsonText);
    return trends;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to analyze trends. Please try again.");
  }
};

const getNextSeason = (): string => {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const year = now.getFullYear();

  // Winter: Dec, Jan, Feb (months 11, 0, 1) -> Next is Spring
  if (month === 11 || month === 0 || month === 1) {
    return `Spring ${year}`;
  }
  // Spring: Mar, Apr, May (months 2, 3, 4) -> Next is Summer
  if (month >= 2 && month <= 4) {
    return `Summer ${year}`;
  }
  // Summer: Jun, Jul, Aug (months 5, 6, 7) -> Next is Fall
  if (month >= 5 && month <= 7) {
    return `Fall ${year}`;
  }
  // Fall: Sep, Oct, Nov (months 8, 9, 10) -> Next is Winter
  return `Winter ${year}/${year + 1}`;
};

export const predictSeasonalTrends = async (): Promise<Trend[]> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY is not set in environment variables.");
  }

  const nextSeason = getNextSeason();
  const prompt = `You are a world-class fashion trend forecaster. Predict the 4 most important fashion trends for the upcoming ${nextSeason} season. For each trend, provide a catchy name, a concise description, and 3 product recommendations. Return the response as a JSON object that adheres to the provided schema.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: trendSchema,
      },
    });

    const jsonText = response.text.trim();
    const trends: Trend[] = JSON.parse(jsonText);
    return trends;
  } catch (error) {
    console.error("Error calling Gemini API for seasonal trends:", error);
    throw new Error("Failed to forecast seasonal trends. Please try again.");
  }
};