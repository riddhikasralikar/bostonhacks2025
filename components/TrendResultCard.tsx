import React from 'react';
import type { Trend } from '../types';

interface TrendResultCardProps {
  trend: Trend;
  index: number;
}

const TrendResultCard: React.FC<TrendResultCardProps> = ({ trend }) => {
  // The image URL is now expected to be provided directly in the trend object from the AI image generation step.
  // A placeholder is used as a fallback in case the imageUrl is unexpectedly missing.
  const imageUrl = trend.imageUrl || `https://via.placeholder.com/400?text=Image+Not+Found`;

  return (
    <div className="border border-gray-200 p-6 flex flex-col h-full">
      <div className="relative w-full aspect-square mb-4 bg-gray-100">
         <img 
            src={imageUrl} 
            alt={trend.trendName}
            className="w-full h-full object-cover"
         />
      </div>
      <h3 className="text-lg font-semibold tracking-wider uppercase mb-2">{trend.trendName}</h3>
      <p className="text-sm text-gray-600 mb-4 flex-grow">{trend.description}</p>
      <div>
        <h4 className="text-sm font-semibold tracking-wider uppercase mb-2">Key Items:</h4>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
          {trend.recommendations.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TrendResultCard;