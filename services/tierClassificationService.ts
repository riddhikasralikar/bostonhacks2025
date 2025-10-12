import type { Product, CategorizedProducts } from '../types';

const LUXURY_BRANDS = new Set([
  'dior', 'chanel', 'prada', 'gucci', 'versace', 'balenciaga',
  'saint laurent', 'ysl', 'valentino', 'givenchy', 'fendi', 
  'celine', 'bottega veneta', 'loewe', 'burberry', 'hermès',
  'louis vuitton', 'tom ford', 'dolce & gabbana', 'alexander mcqueen'
]);

const LUXURY_RETAILERS = new Set([
  'net-a-porter.com', 'farfetch.com', 'ssense.com', 'matchesfashion.com',
  'mytheresa.com', 'bergdorfgoodman.com', 'saksfifthavenue.com',
  'nordstrom.com', 'bloomingdales.com', 'neimanmarcus.com'
]);

const ACCESSIBLE_RETAILERS = new Set([
  'hm.com', 'zara.com', 'forever21.com', 'asos.com', 'shein.com',
  'uniqlo.com', 'target.com', 'walmart.com', 'amazon.com',
  'oldnavy.com', 'gap.com', 'primark.com'
]);

export const classifyProductTier = (
  product: Product
): 'luxury' | 'mid' | 'accessible' => {
  const brand = product.brand?.toLowerCase() || '';
  const name = product.name.toLowerCase();
  const retailer = product.retailer.toLowerCase();
  const price = product.price;

  if (
    price >= 800 ||
    LUXURY_BRANDS.has(brand) ||
    LUXURY_RETAILERS.has(retailer) ||
    Array.from(LUXURY_BRANDS).some(luxBrand => name.includes(luxBrand))
  ) {
    return 'luxury';
  }

  if (price < 80 || ACCESSIBLE_RETAILERS.has(retailer)) {
    return 'accessible';
  }

  return 'mid';
};

export const categorizeProducts = (
  products: Product[]
): CategorizedProducts => {
  const categorized: CategorizedProducts = {
    luxury: [],
    mid: [],
    accessible: [],
  };

  products.forEach(product => {
    const tier = classifyProductTier(product);
    product.tier = tier;
    categorized[tier].push(product);
  });

  return categorized;
};

export const filterByTiers = (
  categorized: CategorizedProducts,
  selectedTiers: ('luxury' | 'mid' | 'accessible')[]
): CategorizedProducts => {
  const filtered: CategorizedProducts = {
    luxury: [],
    mid: [],
    accessible: [],
  };

  selectedTiers.forEach(tier => {
    filtered[tier] = categorized[tier];
  });

  return filtered;
};

export const limitResultsPerTier = (
  categorized: CategorizedProducts,
  limit: number
): CategorizedProducts => {
  return {
    luxury: categorized.luxury.slice(0, limit),
    mid: categorized.mid.slice(0, limit),
    accessible: categorized.accessible.slice(0, limit),
  };
};