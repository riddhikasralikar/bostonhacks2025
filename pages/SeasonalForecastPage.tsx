
import React from 'react';

const ProgressBar: React.FC<{ label: string; percentage: number }> = ({ label, percentage }) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">{label}</span>
            <span className="text-sm font-medium text-gray-500">{percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 h-2">
            <div className="bg-black h-2" style={{ width: `${percentage}%` }}></div>
        </div>
    </div>
);

const VideoCard: React.FC<{ title: string; duration: string; views: string; index: number }> = ({ title, duration, views, index }) => (
    <div className="border border-gray-200">
        <div className="relative w-full aspect-video bg-gray-100 flex items-center justify-center">
            <img 
                src={`https://picsum.photos/seed/video${index}/400/225`}
                alt={title}
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 ml-1">
                        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.742 1.295 2.545 0 3.286L7.279 20.99c-1.25.717-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
        </div>
        <div className="p-4">
            <h4 className="font-semibold mb-2">{title}</h4>
            <div className="flex justify-between text-sm text-gray-500">
                <span>{duration}</span>
                <span>{views} views</span>
            </div>
        </div>
    </div>
);

const BrandCard: React.FC<{ name: string; index: number }> = ({ name, index }) => (
    <div className="border border-gray-200 aspect-square flex items-center justify-center p-4">
        <img src={`https://picsum.photos/seed/brand${index}/200/200`} alt={name} className="max-w-full max-h-24" />
    </div>
);

const SustainabilityPage: React.FC = () => {
    return (
        <div className="container mx-auto px-6 py-12">
            <div className="max-w-4xl mx-auto text-center mb-16">
                <h1 className="text-4xl font-bold tracking-tight mb-4">Sustainability Hub</h1>
                <p className="text-lg text-gray-600">
                    Learn how to build a more sustainable wardrobe with eco-friendly tips, upcycling tutorials, and conscious brand recommendations.
                </p>
            </div>

            {/* Sustainability Score */}
            <section className="max-w-4xl mx-auto border border-black p-8 md:p-12 mb-20">
                <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="flex-1">
                        <h2 className="text-2xl font-semibold mb-6 tracking-wide">Your Sustainability Score</h2>
                        <div className="space-y-6">
                            <ProgressBar label="Eco-Friendly Purchases" percentage={85} />
                            <ProgressBar label="Wardrobe Longevity" percentage={72} />
                            <ProgressBar label="Upcycling Activity" percentage={65} />
                        </div>
                    </div>
                    <div className="flex-shrink-0 text-center">
                        <div className="w-48 h-48 rounded-full border-4 border-black flex flex-col items-center justify-center">
                            <span className="text-6xl font-bold">78</span>
                            <span className="text-sm text-gray-600">out of 100</span>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Upcycling Videos */}
            <section className="mb-20">
                <h2 className="text-3xl font-bold text-center mb-8 tracking-tight">Upcycling Video Tutorials</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <VideoCard title="Transform Old Jeans Into a Tote!" duration="8:45" views="124K" index={1} />
                    <VideoCard title="No-Sew T-Shirt Upcycle Ideas" duration="12:30" views="250K" index={2} />
                    <VideoCard title="DIY Patchwork Denim Jacket" duration="15:10" views="98K" index={3} />
                </div>
            </section>

            {/* Eco Brands */}
            <section>
                <h2 className="text-3xl font-bold text-center mb-8 tracking-tight">Eco-Friendly Brands We ♡</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <BrandCard name="Patagonia" index={1} />
                    <BrandCard name="Everlane" index={2} />
                    <BrandCard name="Veja" index={3} />
                    <BrandCard name="Reformation" index={4} />
                </div>
            </section>
        </div>
    );
};

export default SustainabilityPage;
