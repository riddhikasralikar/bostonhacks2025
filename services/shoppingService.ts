import axios from 'axios';
import type { Product } from '../types';

const SERPAPI_KEY = import.meta.env.VITE_SERPAPI_KEY;

interface SerpApiProduct {
  position: number;
  title: string;
  link: string;
  product_link: string;
  product_id: string;
  serpapi_product_api?: string;
  source: string;
  price?: string;
  extracted_price?: number;
  rating?: number;
  reviews?: number;
  thumbnail?: string;
  delivery?: string;
}

interface SerpApiResponse {
  shopping_results?: SerpApiProduct[];
  search_metadata: {
    status: string;
  };
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const generateFallbackQuery = (query: string): string => {
  const words = query.toLowerCase().split(' ');
  const commonAdjectives = ['sculptural', 'deconstructed', 'asymmetrical', 'structured', 
    'textural', 'embellished', 'statement', 'dramatic', 'bold', 'avant-garde'];
  const filteredWords = words.filter(word => !commonAdjectives.includes(word));
  return filteredWords.slice(-2).join(' ') || words.slice(-1).join(' ');
};

export const searchProducts = async (
  query: string,
  maxResults: number = 30
): Promise<Product[]> => {
  if (!SERPAPI_KEY) {
    throw new Error('VITE_SERPAPI_KEY is not set in environment variables.');
  }

  try {
    console.log(`Searching for: "${query}"`);
    
    let response = await axios.get<SerpApiResponse>(
      'https://serpapi.com/search',
      {
        params: {
          engine: 'google_shopping',
          q: query,
          api_key: SERPAPI_KEY,
          num: Math.min(maxResults, 100),
          gl: 'us', // Country: United States
          hl: 'en', // Language: English
        },
      }
    );

    let results: SerpApiProduct[] = response.data.shopping_results || [];
    
    // If no results, try a broader search
    if (results.length === 0) {
      const fallbackQuery = generateFallbackQuery(query);
      console.log(`No results found. Trying broader search: "${fallbackQuery}"`);
      
      response = await axios.get<SerpApiResponse>(
        'https://serpapi.com/search',
        {
          params: {
            engine: 'google_shopping',
            q: fallbackQuery,
            api_key: SERPAPI_KEY,
            num: Math.min(maxResults, 100),
            gl: 'us',
            hl: 'en',
          },
        }
      );
      
      results = response.data.shopping_results || [];
    }
    
    console.log(`Found ${results.length} products for "${query}"`);
    
    // Add a small delay to avoid rate limiting
    await delay(200);

    return results.map(item => {
      const price = item.extracted_price || parsePrice(item.price || '0');

      return {
        id: item.product_id || `${item.position}`,
        name: item.title,
        price: price,
        currency: 'USD',
        retailer: item.source || 'Google Shopping',
        url: item.product_link || item.link,
        image: item.thumbnail,
        rating: item.rating,
        brand: extractBrand(item.title),
      };
    });
  } catch (error: any) {
    if (error.response) {
      console.error('API Error Response:', error.response.data);
      console.error('API Error Status:', error.response.status);
      
      if (error.response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      } else if (error.response.status === 401 || error.response.status === 403) {
        throw new Error('API key is invalid or quota exceeded.');
      }
    }
    
    console.error('Error searching products:', error);
    throw new Error('Failed to search for products. Please try again.');
  }
};

const parsePrice = (priceString: string): number => {
  const cleaned = priceString.replace(/[$,€£¥\s]/g, '').trim();
  const number = parseFloat(cleaned);
  return isNaN(number) ? 0 : number;
};

const extractBrand = (title: string): string | undefined => {
  const words = title.split(' ');
  if (words.length > 0) {
    return words[0];
  }
  return undefined;
};

export const deduplicateProducts = (products: Product[]): Product[] => {
  const seen = new Set<string>();
  return products.filter(product => {
    if (seen.has(product.url)) {
      return false;
    }
    seen.add(product.url);
    return true;
  });
};