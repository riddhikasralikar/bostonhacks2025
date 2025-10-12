import React from 'react';

interface TierSelectorProps {
  selectedTiers: ('luxury' | 'mid' | 'accessible')[];
  onChange: (tiers: ('luxury' | 'mid' | 'accessible')[]) => void;
}

const TierSelector: React.FC<TierSelectorProps> = ({ selectedTiers, onChange }) => {
  const toggleTier = (tier: 'luxury' | 'mid' | 'accessible') => {
    if (selectedTiers.includes(tier)) {
      onChange(selectedTiers.filter(t => t !== tier));
    } else {
      onChange([...selectedTiers, tier]);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
      <p className="text-sm font-semibold uppercase tracking-wider">Select Price Range:</p>
      
      <button
        onClick={() => toggleTier('accessible')}
        className={`px-6 py-3 border-2 transition-all ${
          selectedTiers.includes('accessible')
            ? 'bg-black text-white border-black'
            : 'bg-white text-black border-gray-300 hover:border-black'
        }`}
      >
        <div className="font-bold">$ Accessible</div>
        <div className="text-xs mt-1">Under $100</div>
      </button>

      <button
        onClick={() => toggleTier('mid')}
        className={`px-6 py-3 border-2 transition-all ${
          selectedTiers.includes('mid')
            ? 'bg-black text-white border-black'
            : 'bg-white text-black border-gray-300 hover:border-black'
        }`}
      >
        <div className="font-bold">$$ Mid-Tier</div>
        <div className="text-xs mt-1">$100-500</div>
      </button>

      <button
        onClick={() => toggleTier('luxury')}
        className={`px-6 py-3 border-2 transition-all ${
          selectedTiers.includes('luxury')
            ? 'bg-black text-white border-black'
            : 'bg-white text-black border-gray-300 hover:border-black'
        }`}
      >
        <div className="font-bold">$$$ Luxury</div>
        <div className="text-xs mt-1">$500+</div>
      </button>
    </div>
  );
};

export default TierSelector;