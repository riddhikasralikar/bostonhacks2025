import React from 'react';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const getTierBadge = (tier?: string) => {
    switch (tier) {
      case 'luxury':
        return <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded">$$$</span>;
      case 'mid':
        return <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">$$</span>;
      case 'accessible':
        return <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">$</span>;
      default:
        return null;
    }
  };

  return (
    <a 
      href={product.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="group border border-gray-200 hover:border-black transition-all duration-200 flex flex-col h-full"
    >
      {/* Image */}
      <div className="aspect-square overflow-hidden bg-gray-100">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-grow flex flex-col">
        {/* Tier Badge */}
        <div className="mb-2">
          {getTierBadge(product.tier)}
        </div>

        {/* Product Name */}
        <h4 className="text-sm font-medium mb-2 line-clamp-2 group-hover:underline">
          {product.name}
        </h4>

        {/* Retailer */}
        <p className="text-xs text-gray-500 mb-2">{product.retailer}</p>

        {/* Price */}
        <p className="text-lg font-bold mt-auto">
          ${product.price.toFixed(2)}
        </p>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-600">
            <span>⭐</span>
            <span>{product.rating.toFixed(1)}</span>
          </div>
        )}
      </div>
    </a>
  );
};

export default ProductCard;