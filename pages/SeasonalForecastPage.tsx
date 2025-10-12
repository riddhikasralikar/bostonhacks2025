import React, { useState, useCallback } from 'react';
import { predictSeasonalTrends } from '../services/geminiService';
import { speakSeasonalForecast } from '../services/elevenLabsService';
import { useVoiceSettings } from '../context/VoiceSettingsContext';
import VoiceSettingsModal from '../components/VoiceSettingsModal';
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

const SettingsIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const SeasonalForecastPage: React.FC = () => {
    const [trends, setTrends] = useState<Trend[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
    
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
            {/* Voice Settings Modal */}
            <VoiceSettingsModal 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)} 
            />

            {/* Settings Button - Fixed position */}
            <button
                onClick={() => setIsSettingsOpen(true)}
                className="fixed bottom-6 right-6 bg-black text-white p-4 rounded-full shadow-lg hover:bg-gray-800 transition-all z-30 flex items-center gap-2"
                title="Voice Settings"
            >
                <SettingsIcon />
                <span className="hidden md:inline text-sm font-medium">Voice Settings</span>
            </button>

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