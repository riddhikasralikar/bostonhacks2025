// components/TrendResultCard.tsx
import React from 'react';
import type { Trend } from '../types';

interface TrendResultCardProps {
  trend: Trend;
  index: number;
}

const TrendResultCard: React.FC<TrendResultCardProps> = ({ trend, index }) => {
  return (
    <div className="border border-black p-6 hover:bg-gray-50 transition-colors duration-200 flex flex-col h-full">
      {/* Trend Number Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
          {index + 1}
        </div>
      </div>

      {/* Trend Name */}
      <h3 className="text-xl font-bold mb-3 tracking-tight">
        {trend.trendName}
      </h3>

      {/* Description */}
      <p className="text-gray-700 mb-6 text-sm leading-relaxed flex-grow">
        {trend.description}
      </p>

      {/* Recommendations */}
      <div className="border-t border-gray-200 pt-4">
        <p className="font-semibold text-sm uppercase tracking-wider mb-3 text-gray-900">
          Shop This Look:
        </p>
        <ul className="space-y-2">
          {trend.recommendations.map((item, i) => (
            <li 
              key={i} 
              className="text-sm text-gray-600 flex items-start gap-2"
            >
              <span className="text-black mt-1">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TrendResultCard;