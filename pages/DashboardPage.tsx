import React, { useState, useCallback } from 'react';
import { predictTrendsFromImages } from '../services/geminiService';
import type { Trend } from '../types';
import TrendResultCard from '../components/TrendResultCard';

const PlusIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const DashboardPage: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [trends, setTrends] = useState<Trend[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            // FIX: Use spread syntax to convert the FileList to an array, ensuring proper type inference for files.
            const selectedFiles = [...event.target.files];
            setFiles(selectedFiles);
            
            const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
            setPreviews(newPreviews);
            
            setTrends(null);
            setError(null);
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
        setError(null);
        setTrends(null);

        try {
            const imagePayloads = await Promise.all(
                files.map(async file => ({
                    base64: await toBase64(file),
                    mimeType: file.type
                }))
            );

            const result = await predictTrendsFromImages(imagePayloads);
            setTrends(result);
        } catch (e) {
            const err = e as Error;
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [files]);

    return (
        <div className="container mx-auto px-6 py-12">
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
                    <p className="mt-4 text-gray-600">Our AI stylist is analyzing your vibe...</p>
                 </div>
            )}
            
            {error && <p className="text-center text-red-500 mt-8">{error}</p>}
            
            {trends && (
                <div className="mt-16">
                    <h2 className="text-3xl font-bold text-center mb-8 tracking-tight">Your Predicted Trends</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {trends.map((trend, index) => (
                           <TrendResultCard key={index} trend={trend} index={index}/>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;