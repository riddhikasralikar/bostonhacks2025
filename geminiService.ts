
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { TrendPrediction } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const trendPredictionSchema = {
  type: Type.OBJECT,
  properties: {
    trendName: {
      type: Type.STRING,
      description: "A catchy, magazine-style name for the trend or item.",
    },
    trendScore: {
      type: Type.INTEGER,
      description: "A score from 1 to 10 indicating its trend potential. 1 is out of style, 10 is the next big thing.",
    },
    analysis: {
      type: Type.STRING,
      description: "A detailed analysis of about 100 words explaining the score. Mention influences, materials, silhouette, and market appeal.",
    },
    stylingSuggestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Three concise, actionable styling tips.",
    },
    longevity: {
      type: Type.STRING,
      description: "The predicted lifespan of the trend (e.g., 'Micro-Fad', 'Seasonal Staple', 'Timeless Classic').",
    },
  },
  required: ["trendName", "trendScore", "analysis", "stylingSuggestions", "longevity"],
};

interface PredictTrendParams {
  textPrompt?: string;
  imagePart?: { inlineData: { data: string; mimeType: string; } };
}

export const predictTrend = async ({ textPrompt, imagePart }: PredictTrendParams): Promise<TrendPrediction> => {
  if (!textPrompt && !imagePart) {
    throw new Error("Either a text prompt or an image must be provided.");
  }

  const parts: any[] = [];
  if (imagePart) {
    parts.push(imagePart);
  }

  const fullPrompt = textPrompt 
    ? `Analyze the following fashion item: "${textPrompt}"` 
    : 'Analyze the fashion item in this image.';
  parts.push({ text: fullPrompt });

  const systemInstruction = "You are 'Oracle', a leading AI fashion trend forecaster. Your tone is sophisticated, authoritative, and concise, akin to a senior editor at Vogue. Provide analysis on fashion items based on current runway trends, street style, cultural zeitgeist, and historical fashion cycles. Respond ONLY with the JSON object defined in the schema.";

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: parts },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: trendPredictionSchema,
        temperature: 0.7,
        topP: 0.9,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as TrendPrediction;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to get trend prediction: ${error.message}`);
    }
    throw new Error("An unknown error occurred while predicting the trend.");
  }
};
