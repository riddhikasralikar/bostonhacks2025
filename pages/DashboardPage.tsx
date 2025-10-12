import React, { useState, useCallback } from 'react';
import { predictTrendsFromImages } from '../services/geminiService';
import { speakUploadMessage, speakTrendResults } from '../services/elevenLabsService';
import { useVoiceSettings } from '../context/VoiceSettingsContext';
import VoiceSettingsModal from '../components/VoiceSettingsModal';
import TierSelector from '../components/TierSelector';
import ShoppingResults from '../components/ShoppingResults';
import { searchAndCategorizeForTrends } from '../services/shoppingOrchestrator';
import type { Trend, ShoppingResults as ShoppingResultsType } from '../types';
import TrendResultCard from '../components/TrendResultCard';

const PlusIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

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

const DashboardPage: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [trends, setTrends] = useState<Trend[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
    
    // Shopping states
    const [selectedTiers, setSelectedTiers] = useState<('luxury' | 'mid' | 'accessible')[]>(['accessible', 'mid']);
    const [shoppingResults, setShoppingResults] = useState<ShoppingResultsType | null>(null);
    const [isLoadingShopping, setIsLoadingShopping] = useState(false);
    
    const { settings } = useVoiceSettings();

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const selectedFiles = [...event.target.files];
            setFiles(selectedFiles);
            
            const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
            setPreviews(newPreviews);
            
            setTrends(null);
            setShoppingResults(null); // Reset shopping results when new images are uploaded
            setError(null);

            // Play upload message with current settings
            try {
                setIsSpeaking(true);
                await speakUploadMessage(
                    settings.selectedStylist.voiceId,
                    settings.selectedLanguage.code,
                    settings.volume,
                    settings.isMuted
                );
                setIsSpeaking(false);
            } catch (err) {
                console.error("Voice error:", err);
                setIsSpeaking(false);
            }
        }
    };

    const toBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });

    const handlePredict = useCallback(async () => {
        if (files.length === 0) {
            setError("Please upload at least one image.");
            return;
        }

        setIsLoading(true);
        setLoadingMessage("Our AI stylist is analyzing your vibe...");
        setError(null);
        setTrends(null);
        setShoppingResults(null); // Reset shopping results

        try {
            const imagePayloads = await Promise.all(
                files.map(async file => ({
                    base64: await toBase64(file),
                    mimeType: file.type
                }))
            );

            const predictedTrends = await predictTrendsFromImages(imagePayloads);
            setTrends(predictedTrends);

            // Speak the results with current settings
            if (predictedTrends && predictedTrends.length >= 4) {
                setIsSpeaking(true);
                speakTrendResults(
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
    }, [files, settings]);

    const handleFindProducts = async () => {
        if (!trends || selectedTiers.length === 0) return;

        setIsLoadingShopping(true);
        setError(null);
        
        try {
            const results = await searchAndCategorizeForTrends(trends, {
                selectedTiers,
                maxResults: 10,
            });
            setShoppingResults(results);
        } catch (error) {
            console.error('Error finding products:', error);
            setError('Failed to find products. Please try again.');
        } finally {
            setIsLoadingShopping(false);
        }
    };

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
                <h1 className="text-4xl font-bold tracking-tight">Stylist Dashboard</h1>
                <p className="text-lg text-gray-600 mt-2">Upload your style inspiration to get started.</p>
            </div>
            
            <div className="max-w-4xl mx-auto">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
                    <input
                        type="file"
                        id="file-upload"
                        multiple
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                        <PlusIcon />
                        <span className="mt-2 text-sm font-medium text-gray-600">
                            {previews.length > 0 ? `${previews.length} images selected` : 'Click to upload your Pinterest board images'}
                        </span>
                        <span className="text-xs text-gray-500">PNG, JPG, WEBP</span>
                    </label>
                </div>

                {previews.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4 text-center">Image Preview:</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {previews.map((src, index) => (
                                <img key={index} src={src} alt={`Preview ${index}`} className="w-full h-auto object-cover rounded-md aspect-square"/>
                            ))}
                        </div>
                    </div>
                )}
                
                <div className="text-center">
                     <button
                        onClick={handlePredict}
                        disabled={isLoading || files.length === 0}
                        className="px-12 py-4 bg-black text-white font-semibold tracking-wider uppercase border border-black hover:bg-white hover:text-black transition-colors duration-300 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Analyzing...' : 'Predict Trends'}
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
                <>
                    <div className="mt-16">
                        <h2 className="text-3xl font-bold text-center mb-8 tracking-tight">Your Predicted Trends</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {trends.map((trend, index) => (
                               <TrendResultCard key={index} trend={trend} index={index}/>
                            ))}
                        </div>
                    </div>

                    {/* Shopping Section */}
                    <div className="mt-16 border-t pt-16">
                        <h2 className="text-3xl font-bold text-center mb-8">Find Your Perfect Pieces</h2>
                        
                        <TierSelector 
                            selectedTiers={selectedTiers}
                            onChange={setSelectedTiers}
                        />

                        <div className="text-center">
                            <button
                                onClick={handleFindProducts}
                                disabled={isLoadingShopping || selectedTiers.length === 0}
                                className="px-12 py-4 bg-black text-white font-semibold tracking-wider uppercase border border-black hover:bg-white hover:text-black transition-colors duration-300 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                            >
                                {isLoadingShopping ? 'Finding Products...' : 'Find Products'}
                            </button>
                        </div>

                        {isLoadingShopping && (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                                <p className="mt-4 text-gray-600">Searching the internet for your perfect pieces...</p>
                            </div>
                        )}

                        {shoppingResults && (
                            <ShoppingResults 
                                results={shoppingResults}
                                selectedTiers={selectedTiers}
                            />
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default DashboardPage;