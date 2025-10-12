import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CRITICAL: Enable CORS first
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { query, maxResults = 30 } = req.query;
  const SERPAPI_KEY = process.env.SERPAPI_KEY;

  console.log('Env var exists:', !!SERPAPI_KEY);
  console.log('Query:', query);

  if (!SERPAPI_KEY) {
    return res.status(500).json({ error: 'SERPAPI_KEY not configured on server' });
  }

  if (!query) {
    return res.status(400).json({ error: 'Query parameter required' });
  }

  try {
    const params = new URLSearchParams({
      engine: 'google_shopping',
      q: query as string,
      api_key: SERPAPI_KEY,
      num: String(Math.min(Number(maxResults), 100)),
      gl: 'us',
      hl: 'en',
    });

    const response = await fetch(
      `https://serpapi.com/search?${params.toString()}`
    );

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('SerpApi Error:', error);
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
}