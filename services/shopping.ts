export interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  retailer: string;
  url: string;
  image?: string;
  brand?: string;
  rating?: number;
  tier?: 'luxury' | 'mid' | 'accessible';
  trendScore?: number;
}

export interface ShoppingFilters {
  selectedTiers: ('luxury' | 'mid' | 'accessible')[];
  maxResults?: number;
}

export interface CategorizedProducts {
  luxury: Product[];
  mid: Product[];
  accessible: Product[];
}

export interface ShoppingResults {
  specificItems: {
    [itemName: string]: CategorizedProducts;
  };
  vibeMatches: CategorizedProducts;
}