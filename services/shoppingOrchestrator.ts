import type { Trend, ShoppingResults, ShoppingFilters } from '../types';
import { searchProducts, deduplicateProducts } from './shoppingService';
import { categorizeProducts, filterByTiers, limitResultsPerTier } from './tierClassificationService';
import { generateVibeQueries } from './queryGenerationService';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Rate-limited search function - only allows 1 request per second
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1200; // 1.2 seconds between requests

const rateLimitedSearch = async (query: string, maxResults: number): Promise<any[]> => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    console.log(`⏳ Waiting ${waitTime}ms to avoid rate limit...`);
    await delay(waitTime);
  }
  
  lastRequestTime = Date.now();
  return await searchProducts(query, maxResults);
};

export const searchAndCategorizeForTrends = async (
  trends: Trend[],
  filters: ShoppingFilters
): Promise<ShoppingResults> => {
  const results: ShoppingResults = {
    specificItems: {},
    vibeMatches: {
      luxury: [],
      mid: [],
      accessible: [],
    },
  };

  try {
    // Process specific items for all trends
    let itemCount = 0;
    const totalItems = trends.reduce((sum, trend) => sum + trend.recommendations.length, 0);
    
    for (const trend of trends) {
      // Limit to first 5 items per trend to reduce API calls
      const itemsToSearch = trend.recommendations.slice(0, 5);
      
      for (const item of itemsToSearch) {
        itemCount++;
        console.log(`🔍 Searching ${itemCount}/${totalItems}: ${item}`);
        
        const products = await rateLimitedSearch(item, 20); // Reduced from 30 to 20
        const deduped = deduplicateProducts(products);
        const categorized = categorizeProducts(deduped);
        const filtered = filterByTiers(categorized, filters.selectedTiers);
        const limited = limitResultsPerTier(filtered, filters.maxResults || 5);
        
        results.specificItems[item] = limited;
      }
    }

    // Process vibe matches (fewer queries to reduce API calls)
    for (const trend of trends) {
      console.log(`✨ Generating vibe queries for: ${trend.trendName}`);
      
      const vibeQueries = await generateVibeQueries(trend, 2); // Reduced from 5 to 2
      
      for (const query of vibeQueries) {
        console.log(`🔍 Searching vibe: ${query}`);
        
        const products = await rateLimitedSearch(query, 15); // Reduced from 20 to 15
        const deduped = deduplicateProducts(products);
        const categorized = categorizeProducts(deduped);
        
        filters.selectedTiers.forEach(tier => {
          results.vibeMatches[tier].push(...categorized[tier]);
        });
      }
    }

    // Deduplicate and limit final vibe matches
    results.vibeMatches = limitResultsPerTier(
      {
        luxury: deduplicateProducts(results.vibeMatches.luxury),
        mid: deduplicateProducts(results.vibeMatches.mid),
        accessible: deduplicateProducts(results.vibeMatches.accessible),
      },
      filters.maxResults || 10
    );

    console.log('✅ All searches complete!');

  } catch (error) {
    console.error('Error in shopping orchestrator:', error);
    throw error;
  }

  return results;
};