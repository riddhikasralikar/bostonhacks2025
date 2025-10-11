
import React, { useState, useCallback } from 'react';
import { TrendPrediction } from './types';
import { predictTrend } from './services/geminiService';
import { ImageUploader } from './components/ImageUploader';
import { PredictionDisplay } from './components/PredictionDisplay';
import { Loader } from './components/Loader';

type ActiveTab = 'image' | 'text';

const TextIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 6.1H3"/><path d="M21 12.1H3"/><path d="M15.1 18.1H3"/></svg>
);

const ImageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
);

const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [prediction, setPrediction] = useState<TrendPrediction | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<ActiveTab>('image');
    
    const [textInput, setTextInput] = useState<string>('');
    const [imageFile, setImageFile] = useState<{ data: string; mimeType: string; } | null>(null);

    const handlePrediction = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setPrediction(null);

        try {
            const result = await predictTrend({
                textPrompt: activeTab === 'text' ? textInput : undefined,
                imagePart: activeTab === 'image' ? (imageFile ? { inlineData: imageFile } : undefined) : undefined,
            });
            setPrediction(result);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [activeTab, textInput, imageFile]);

    const isSubmissionDisabled = (activeTab === 'image' && !imageFile) || (activeTab === 'text' && textInput.trim() === '');

    return (
        <div className="bg-black text-white min-h-screen p-4 sm:p-8">
            <div className="max-w-3xl mx-auto">
                <header className="text-center mb-10 border-b border-zinc-700 pb-6">
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Foretell Fashion</h1>
                    <p className="text-zinc-400 mt-2 text-lg">AI-Powered Trend Analysis</p>
                </header>

                <main>
                    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 mb-8">
                        <div className="flex border-b border-zinc-700 mb-6">
                            <button
                                onClick={() => setActiveTab('image')}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors duration-200 ${activeTab === 'image' ? 'text-white border-b-2 border-white' : 'text-zinc-400 hover:text-white'}`}
                            >
                                <ImageIcon/> Analyze Image
                            </button>
                            <button
                                onClick={() => setActiveTab('text')}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors duration-200 ${activeTab === 'text' ? 'text-white border-b-2 border-white' : 'text-zinc-400 hover:text-white'}`}
                            >
                                <TextIcon/> Describe Item
                            </button>
                        </div>
                        
                        {activeTab === 'image' ? (
                            <ImageUploader onImageUpload={setImageFile} />
                        ) : (
                            <div>
                                <label htmlFor="text-input" className="block text-sm font-medium text-zinc-300 mb-2">Describe a fashion item or trend</label>
                                <textarea
                                    id="text-input"
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    placeholder="e.g., 'A pair of oversized, acid-wash denim jeans with cargo pockets.'"
                                    className="w-full h-32 p-3 bg-zinc-800 border border-zinc-600 rounded-md focus:ring-2 focus:ring-white focus:outline-none transition-all placeholder-zinc-500"
                                />
                            </div>
                        )}

                        <button
                            onClick={handlePrediction}
                            disabled={isSubmissionDisabled || isLoading}
                            className="w-full mt-6 bg-white text-black font-bold py-3 px-4 rounded-md hover:bg-zinc-200 disabled:bg-zinc-600 disabled:text-zinc-400 disabled:cursor-not-allowed transition-colors duration-300"
                        >
                            {isLoading ? 'Analyzing...' : 'Predict Trend'}
                        </button>
                    </div>

                    {isLoading && <Loader />}
                    
                    {error && (
                        <div className="border border-red-500 bg-red-900/20 text-red-300 p-4 rounded-lg text-center">
                            <p className="font-semibold">Analysis Failed</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {prediction && (
                        <div className="animate-fade-in">
                           <PredictionDisplay prediction={prediction} />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default App;
