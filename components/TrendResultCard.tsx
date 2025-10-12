import React from 'react';
import type { Trend } from '../types';

interface TrendResultCardProps {
  trend: Trend;
  index: number;
}

const TrendResultCard: React.FC<TrendResultCardProps> = ({ trend }) => {
  return (
    <div className="border border-gray-200 p-6 flex flex-col h-full">
      <h3 className="text-lg font-semibold tracking-wider uppercase mb-2">{trend.trendName}</h3>
      <p className="text-sm text-gray-600 mb-4 flex-grow">{trend.description}</p>
      <div>
        <h4 className="text-sm font-semibold tracking-wider uppercase mb-2">Key Items:</h4>
        <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
          {trend.recommendations.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default TrendResultCard;