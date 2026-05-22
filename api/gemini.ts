import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

const trendSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      trendName: { type: Type.STRING },
      description: { type: Type.STRING },
      recommendations: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
    },
    required: ['trendName', 'description', 'recommendations'],
  },
};

const getNextSeason = (): string => {
  const month = new Date().getMonth();
  const year = new Date().getFullYear();
  if (month === 11 || month <= 1) return `Spring ${year}`;
  if (month <= 4) return `Summer ${year}`;
  if (month <= 7) return `Fall ${year}`;
  return `Winter ${year}/${year + 1}`;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });

  const ai = new GoogleGenAI({ apiKey });
  const { type, images, trend, count } = req.body;

  try {
    if (type === 'analyze') {
      const imageParts = images.map((img: { base64: string; mimeType: string }) => ({
        inlineData: { data: img.base64, mimeType: img.mimeType },
      }));
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: {
          parts: [
            ...imageParts,
            { text: 'You are an expert fashion trend forecaster. Analyze the provided images from a style inspiration board. Identify 4 key emerging fashion trends based on the items, aesthetics, colors, and silhouettes. Return JSON matching the schema.' },
          ],
        },
        config: { responseMimeType: 'application/json', responseSchema: trendSchema },
      });
      return res.status(200).json(JSON.parse(response.text.trim()));
    }

    if (type === 'seasonal') {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: { parts: [{ text: `You are a world-class fashion trend forecaster. Predict the 4 most important fashion trends for ${getNextSeason()}. Return JSON matching the schema.` }] },
        config: { responseMimeType: 'application/json', responseSchema: trendSchema },
      });
      return res.status(200).json(JSON.parse(response.text.trim()));
    }

    if (type === 'queries') {
      const prompt = `Given this fashion trend:\n- Name: "${trend.trendName}"\n- Description: ${trend.description}\n\nGenerate ${count ?? 10} diverse shopping search queries. Return ONLY a JSON array of strings.\n\nExample: ["flowy maxi dress", "chunky gold hoops"]`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: { parts: [{ text: prompt }] },
      });
      const text = response.text.trim().replace(/```json|```/g, '').trim();
      return res.status(200).json(JSON.parse(text));
    }

    return res.status(400).json({ error: 'Invalid type' });
  } catch (error: any) {
    console.error('Gemini API error:', error);
    return res.status(500).json({ error: error.message ?? 'Gemini API call failed' });
  }
}
