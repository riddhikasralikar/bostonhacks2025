import React, { useState } from 'react';
import type { ShoppingResults as ShoppingResultsType } from '../types';
import ProductCard from './ProductCard';

interface ShoppingResultsProps {
  results: ShoppingResultsType;
  selectedTiers: ('luxury' | 'mid' | 'accessible')[];
}

const ShoppingResults: React.FC<ShoppingResultsProps> = ({ results, selectedTiers }) => {
  const [activeTab, setActiveTab] = useState<'specific' | 'vibe'>('specific');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (itemName: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemName)) {
      newExpanded.delete(itemName);
    } else {
      newExpanded.add(itemName);
    }
    setExpandedItems(newExpanded);
  };

  const tierLabels = {
    luxury: '$$$',
    mid: '$$',
    accessible: '$',
  };

  return (
    <div className="mt-12">
      <h2 className="text-3xl font-bold text-center mb-8">Shop Your Trends</h2>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setActiveTab('specific')}
          className={`px-8 py-3 font-semibold transition-all ${
            activeTab === 'specific'
              ? 'bg-black text-white'
              : 'bg-white text-black border border-black hover:bg-gray-100'
          }`}
        >
          Shop This Look
        </button>
        <button
          onClick={() => setActiveTab('vibe')}
          className={`px-8 py-3 font-semibold transition-all ${
            activeTab === 'vibe'
              ? 'bg-black text-white'
              : 'bg-white text-black border border-black hover:bg-gray-100'
          }`}
        >
          More Picks
        </button>
      </div>

      {/* Specific Items */}
      {activeTab === 'specific' && (
        <div className="space-y-8">
          {Object.entries(results.specificItems).map(([itemName, categorized]) => {
            const totalProducts = selectedTiers.reduce(
              (sum, tier) => sum + categorized[tier].length,
              0
            );

            if (totalProducts === 0) return null;

            const isExpanded = expandedItems.has(itemName);

            return (
              <div key={itemName} className="border border-gray-200 p-6">
                <button
                  onClick={() => toggleItem(itemName)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h3 className="text-xl font-bold">{itemName}</h3>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      {totalProducts} {totalProducts === 1 ? 'item' : 'items'}
                    </span>
                    <span className="text-2xl">{isExpanded ? '−' : '+'}</span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-6 space-y-6">
                    {selectedTiers.map(tier => {
                      if (categorized[tier].length === 0) return null;

                      return (
                        <div key={tier}>
                          <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-gray-700">
                            {tierLabels[tier]} {tier.charAt(0).toUpperCase() + tier.slice(1)}
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {categorized[tier].map(product => (
                              <ProductCard key={product.id} product={product} />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Vibe Matches */}
      {activeTab === 'vibe' && (
        <div className="space-y-6">
          {selectedTiers.map(tier => {
            if (results.vibeMatches[tier].length === 0) return null;

            return (
              <div key={tier}>
                <h3 className="text-2xl font-bold mb-4">
                  {tierLabels[tier]} {tier.charAt(0).toUpperCase() + tier.slice(1)} Picks
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {results.vibeMatches[tier].map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ShoppingResults;