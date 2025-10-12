import axios from 'axios';
import type { Product } from '../types';

// Use your serverless function URL
const API_ENDPOINT = '/api/search';

interface SerpApiProduct {
  position: number;
  title: string;
  link: string;
  product_link: string;
  product_id: string;
  source: string;
  price?: string;
  extracted_price?: number;
  rating?: number;
  reviews?: number;
  thumbnail?: string;
}

interface SerpApiResponse {
  shopping_results?: SerpApiProduct[];
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
  try {
    console.log(`Searching for: "${query}"`);
    
    let response = await axios.get<SerpApiResponse>(API_ENDPOINT, {
      params: {
        query,
        maxResults: Math.min(maxResults, 100),
      },
    });

    let results: SerpApiProduct[] = response.data.shopping_results || [];
    
    if (results.length === 0) {
      const fallbackQuery = generateFallbackQuery(query);
      console.log(`No results found. Trying broader search: "${fallbackQuery}"`);
      
      response = await axios.get<SerpApiResponse>(API_ENDPOINT, {
        params: {
          query: fallbackQuery,
          maxResults: Math.min(maxResults, 100),
        },
      });
      
      results = response.data.shopping_results || [];
    }
    
    console.log(`Found ${results.length} products for "${query}"`);
    
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