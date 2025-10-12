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
      imageSearchTerm: {
        type: Type.STRING,
        description: "A concise, 3-4 word search term for Unsplash that will find a high-quality photo of relevant clothing, preferably in a street style or editorial context. E.g., 'street style oversized blazer', 'woman wearing leather trousers', 'close-up silk slip dress'."
      }
    },
    required: ["trendName", "description", "recommendations", "imageSearchTerm"],
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

  const prompt = `You are an expert fashion trend forecaster. Analyze the provided images from a user's style inspiration board. Identify 4 key emerging fashion trends based on the items, aesthetics, colors, and silhouettes in these images. For each trend, provide a name, a short description, 3 product recommendations, and a concise, highly specific 3-4 word search term for a stock photo service to find a relevant photo of clothing for this trend (e.g., 'street style oversized blazer'). Return the response as a JSON object that adheres to the provided schema.`;

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
    if (!process.env.API_KEY) {
        throw new Error("API_KEY is not set in environment variables.");
    }

    const nextSeason = getNextSeason();
    const prompt = `You are a world-class fashion trend forecaster. Predict the 4 most important fashion trends for the upcoming ${nextSeason} season. For each trend, provide a catchy name, a concise description, 3 product recommendations, and a concise, highly specific 3-4 word search term for a stock photo service to find a relevant photo of clothing for this trend (e.g., 'woman wearing leather trousers'). Return the response as a JSON object that adheres to the provided schema.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
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

export const generateTrendImage = async (trendName: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is not set in environment variables.");
  }
  
  const prompt = `A high-quality, editorial fashion photograph of an outfit representing the '${trendName}' trend. Street style, clean background, focus on the clothing.`;

  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      return response.generatedImages[0].image.imageBytes;
    } else {
      throw new Error("Image generation failed to return an image.");
    }
  } catch (error) {
    console.error(`Error generating image for trend "${trendName}":`, error);
    throw new Error(`Failed to generate an image for the trend: ${trendName}.`);
  }
};