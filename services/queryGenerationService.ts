import { GoogleGenAI } from "@google/genai";
import type { Trend } from '../types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export const generateVibeQueries = async (
  trend: Trend,
  count: number = 10
): Promise<string[]> => {
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY is not set');
  }

  const prompt = `
Given this fashion trend:
- Name: "${trend.trendName}"
- Description: ${trend.description}

Generate ${count} diverse shopping search queries that would find items matching this aesthetic.

Requirements:
- Include variety in item types (tops, bottoms, dresses, outerwear, accessories, shoes)
- Use descriptive keywords that capture the trend's aesthetic
- Keep queries concise (2-5 words each)
- Make them searchable on shopping platforms
- Don't repeat the exact trend name

Return ONLY a JSON array of query strings, nothing else.

Example format: ["flowy maxi dress", "chunky gold hoops", "oversized blazer"]
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: {
        parts: [{ text: prompt }],
      },
    });

    const text = response.text.trim();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const queries: string[] = JSON.parse(cleaned);
    
    return queries;
  } catch (error) {
    console.error('Error generating vibe queries:', error);
    return [
      `${trend.trendName} clothing`,
      `${trend.trendName} accessories`,
      `${trend.trendName} style`,
    ];
  }
};