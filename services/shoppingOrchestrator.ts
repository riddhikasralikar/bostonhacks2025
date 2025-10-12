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
  
  try {
    const results = await searchProducts(query, maxResults);
    console.log(`✅ Successfully fetched ${results.length} products for "${query}"`);
    return results;
  } catch (error) {
    console.error(`❌ Failed to fetch products for "${query}":`, error);
    // Return empty array instead of throwing to allow other searches to continue
    return [];
  }
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

  console.log('🚀 Starting shopping search for trends:', trends.map(t => t.trendName).join(', '));
  console.log('💰 Selected price tiers:', filters.selectedTiers.join(', '));

  try {
    // Process specific items for all trends
    let itemCount = 0;
    const totalItems = trends.reduce((sum, trend) => sum + Math.min(trend.recommendations.length, 5), 0);
    
    console.log(`📊 Total items to search: ${totalItems}`);
    
    for (const trend of trends) {
      console.log(`\n🎯 Processing trend: "${trend.trendName}"`);
      
      // Limit to first 5 items per trend to reduce API calls
      const itemsToSearch = trend.recommendations.slice(0, 5);
      console.log(`   Items to search: ${itemsToSearch.join(', ')}`);
      
      for (const item of itemsToSearch) {
        itemCount++;
        console.log(`\n📍 [${itemCount}/${totalItems}] Searching: "${item}"`);
        
        const products = await rateLimitedSearch(item, 20);
        
        if (products.length === 0) {
          console.warn(`⚠️ No products found for "${item}"`);
          results.specificItems[item] = {
            luxury: [],
            mid: [],
            accessible: [],
          };
          continue;
        }
        
        const deduped = deduplicateProducts(products);
        const categorized = categorizeProducts(deduped);
        const filtered = filterByTiers(categorized, filters.selectedTiers);
        const limited = limitResultsPerTier(filtered, filters.maxResults || 5);
        
        results.specificItems[item] = limited;
        
        console.log(`   ✅ Found: ${limited.luxury.length} luxury, ${limited.mid.length} mid, ${limited.accessible.length} accessible`);
      }
    }

    // Process vibe matches (fewer queries to reduce API calls)
    console.log('\n✨ Generating vibe matches...');
    
    for (const trend of trends) {
      console.log(`\n🎨 Generating vibe queries for: "${trend.trendName}"`);
      
      try {
        const vibeQueries = await generateVibeQueries(trend, 2); // Reduced from 5 to 2
        console.log(`   Generated queries: ${vibeQueries.join(', ')}`);
        
        for (const query of vibeQueries) {
          console.log(`   🔍 Searching vibe: "${query}"`);
          
          const products = await rateLimitedSearch(query, 15); // Reduced from 20 to 15
          
          if (products.length === 0) {
            console.warn(`   ⚠️ No products found for vibe query "${query}"`);
            continue;
          }
          
          const deduped = deduplicateProducts(products);
          const categorized = categorizeProducts(deduped);
          
          filters.selectedTiers.forEach(tier => {
            results.vibeMatches[tier].push(...categorized[tier]);
          });
          
          console.log(`   ✅ Added ${deduped.length} products to vibe matches`);
        }
      } catch (error) {
        console.error(`   ❌ Failed to generate vibe queries for "${trend.trendName}":`, error);
        // Continue with other trends even if this one fails
      }
    }

    // Deduplicate and limit final vibe matches
    console.log('\n🔄 Deduplicating and limiting vibe matches...');
    results.vibeMatches = limitResultsPerTier(
      {
        luxury: deduplicateProducts(results.vibeMatches.luxury),
        mid: deduplicateProducts(results.vibeMatches.mid),
        accessible: deduplicateProducts(results.vibeMatches.accessible),
      },
      filters.maxResults || 10
    );

    console.log('\n🎉 All searches complete!');
    console.log(`📦 Total specific items: ${Object.keys(results.specificItems).length}`);
    console.log(`✨ Total vibe matches: ${results.vibeMatches.luxury.length + results.vibeMatches.mid.length + results.vibeMatches.accessible.length}`);

  } catch (error) {
    console.error('💥 Fatal error in shopping orchestrator:', error);
    throw error;
  }

  return results;
};