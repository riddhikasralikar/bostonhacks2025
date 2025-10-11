
import React from 'react';
import { TrendPrediction } from '../types';

interface TrendScoreProps {
    score: number;
}

const TrendScore: React.FC<TrendScoreProps> = ({ score }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 10) * circumference;

    let strokeColor = 'stroke-zinc-400';
    if (score >= 8) strokeColor = 'stroke-green-400';
    else if (score >= 5) strokeColor = 'stroke-yellow-400';
    else strokeColor = 'stroke-red-400';

    return (
        <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                <circle
                    className="stroke-zinc-700"
                    strokeWidth="10"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                />
                <circle
                    className={`transition-all duration-1000 ease-out ${strokeColor}`}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                    transform="rotate(-90 60 60)"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-bold text-white">{score}</span>
                <span className="text-xs text-zinc-400">/ 10</span>
            </div>
        </div>
    );
};

interface PredictionDisplayProps {
    prediction: TrendPrediction;
}

export const PredictionDisplay: React.FC<PredictionDisplayProps> = ({ prediction }) => {
    return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center justify-center text-center md:col-span-1 border-b md:border-b-0 md:border-r border-zinc-700 pb-6 md:pb-0 md:pr-8">
                    <h2 className="text-2xl font-bold tracking-tight mb-2">{prediction.trendName}</h2>
                    <p className="text-sm font-medium bg-zinc-700 text-zinc-200 px-3 py-1 rounded-full mb-4">{prediction.longevity}</p>
                    <TrendScore score={prediction.trendScore} />
                </div>

                <div className="md:col-span-2">
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-2">Analysis</h3>
                        <p className="text-zinc-300 leading-relaxed">{prediction.analysis}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3">Styling Suggestions</h3>
                        <ul className="space-y-3">
                            {prediction.stylingSuggestions.map((suggestion, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="text-zinc-500 mr-3 mt-1">&#10140;</span>
                                    <span className="text-zinc-300">{suggestion}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
