
import React, { useState, useCallback, useRef } from 'react';

interface ImageUploaderProps {
    onImageUpload: (file: { data: string; mimeType: string; } | null) => void;
}

const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // remove the "data:mimeType;base64," prefix
            resolve(result.split(',')[1]);
        };
        reader.onerror = (error) => reject(error);
    });
    
const UploadIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);


export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback(async (file: File | null) => {
        if (file && file.type.startsWith('image/')) {
            const base64Data = await fileToBase64(file);
            onImageUpload({ data: base64Data, mimeType: file.type });
            setPreview(URL.createObjectURL(file));
        } else {
            onImageUpload(null);
            setPreview(null);
        }
    }, [onImageUpload]);

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const file = e.dataTransfer.files && e.dataTransfer.files[0];
        handleFile(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0];
        handleFile(file);
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <div 
            className={`relative border-2 border-dashed border-zinc-600 rounded-lg p-6 text-center cursor-pointer transition-colors duration-300 ${isDragging ? 'border-white bg-zinc-700' : 'hover:border-zinc-400'}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
        >
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />
            {preview ? (
                <>
                    <img src={preview} alt="Preview" className="mx-auto max-h-48 rounded-md object-contain" />
                     <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleFile(null);
                        }}
                        className="mt-4 text-sm text-zinc-400 hover:text-white underline"
                    >
                        Clear Image
                    </button>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center text-zinc-400">
                    <UploadIcon className="w-10 h-10 mb-3" />
                    <p className="font-semibold text-zinc-300">Drag & drop an image here</p>
                    <p className="text-sm">or click to select a file</p>
                </div>
            )}
        </div>
    );
};
