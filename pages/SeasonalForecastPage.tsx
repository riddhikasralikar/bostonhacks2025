import React, { useState, useCallback } from 'react';
import { predictSeasonalTrends } from '../services/geminiService';
import type { Trend } from '../types';
import TrendResultCard from '../components/TrendResultCard';

const SeasonalForecastPage: React.FC = () => {
    const [trends, setTrends] = useState<Trend[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState<string>('');

    const handleForecast = useCallback(async () => {
        setIsLoading(true);
        setLoadingMessage("Scanning the fashion horizon for what's next...");
        setError(null);
        setTrends(null);

        try {
            const predictedTrends = await predictSeasonalTrends();
            setTrends(predictedTrends);
        } catch (e) {
            const err = e as Error;
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, []);

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight">Seasonal Trend Forecast</h1>
                <p className="text-lg text-gray-600 mt-2 max-w-2xl mx-auto">
                    Get a glimpse into the future. Our AI analyzes global fashion signals to predict next season's key trends.
                </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
                <div className="text-center">
                     <button
                        onClick={handleForecast}
                        disabled={isLoading}
                        className="px-12 py-4 bg-black text-white font-semibold tracking-wider uppercase border border-black hover:bg-white hover:text-black transition-colors duration-300 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Forecasting...' : "Forecast Next Season's Trends"}
                    </button>
                </div>
            </div>

            {isLoading && (
                 <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                    <p className="mt-4 text-gray-600">{loadingMessage}</p>
                 </div>
            )}
            
            {error && <p className="text-center text-red-500 mt-8">{error}</p>}
            
            {trends && (
                <div className="mt-16">
                    <h2 className="text-3xl font-bold text-center mb-8 tracking-tight">Upcoming Seasonal Trends</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {trends.map((trend, index) => (
                           <TrendResultCard key={index} trend={trend} index={index} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SeasonalForecastPage;