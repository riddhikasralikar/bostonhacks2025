import React, { useState, useCallback } from 'react';
import { predictSeasonalTrends } from '../services/geminiService';
import { speakSeasonalForecast } from '../services/elevenLabsService';
import { useVoiceSettings } from '../context/VoiceSettingsContext';
import type { Trend } from '../types';
import TrendResultCard from '../components/TrendResultCard';

const SpeakerIcon: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        className={`w-6 h-6 ${isPlaying ? 'animate-pulse' : ''}`}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
    </svg>
);

const SeasonalForecastPage: React.FC = () => {
    const [trends, setTrends] = useState<Trend[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
    
    const { settings } = useVoiceSettings();

    const handleForecast = useCallback(async () => {
        setIsLoading(true);
        setLoadingMessage("Scanning the fashion horizon for what's next...");
        setError(null);
        setTrends(null);

        try {
            const predictedTrends = await predictSeasonalTrends();
            setTrends(predictedTrends);

            // Speak the seasonal forecast with current settings
            if (predictedTrends && predictedTrends.length >= 4) {
                setIsSpeaking(true);
                speakSeasonalForecast(
                    predictedTrends,
                    settings.selectedStylist.voiceId,
                    settings.selectedLanguage.code,
                    settings.volume,
                    settings.isMuted
                )
                    .then(() => setIsSpeaking(false))
                    .catch(err => {
                        console.error("Voice error:", err);
                        setIsSpeaking(false);
                    });
            }
        } catch (e) {
            const err = e as Error;
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [settings]);

    return (
        <div className="container mx-auto px-6 py-12">
            {/* Voice indicator */}
            {isSpeaking && !settings.isMuted && (
                <div className="fixed top-20 right-6 bg-black text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg z-50">
                    <SpeakerIcon isPlaying={true} />
                    <span className="text-sm font-medium">
                        {settings.selectedStylist.name} is speaking...
                    </span>
                </div>
            )}

            {/* Muted indicator */}
            {settings.isMuted && (
                <div className="fixed top-20 right-6 bg-gray-500 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg z-50">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.531V19.94a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.395C2.806 8.757 3.63 8.25 4.51 8.25H6.75z" />
                    </svg>
                    <span className="text-sm font-medium">Voice Muted</span>
                </div>
            )}

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