
import { GoogleGenAI, Type } from "@google/genai";
import type { Trend } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

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
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is not set in environment variables.");
  }
  if (images.length === 0) {
    throw new Error("At least one image is required to predict trends.");
  }

  const imageParts = images.map(img => fileToGenerativePart(img.base64, img.mimeType));

  const prompt = `You are an expert fashion trend forecaster. Analyze the provided images from a user's style inspiration board. Identify 4 key emerging fashion trends based on the items, aesthetics, colors, and silhouettes in these images. For each trend, provide a name, a short description (2-3 sentences), and suggest 3 specific, generic product recommendations that fit the trend. Return the response as a JSON object that adheres to the provided schema.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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
