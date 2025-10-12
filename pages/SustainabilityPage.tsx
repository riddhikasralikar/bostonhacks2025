"use client"

import React, { useState, useEffect } from "react"
import { speakSustainabilityIntro } from '../services/elevenLabsService';
import { useVoiceSettings } from '../context/VoiceSettingsContext';
import VoiceSettingsModal from '../components/VoiceSettingsModal';

// --- Progress bar component ---
const ProgressBar: React.FC<{ label: string; percentage: number }> = ({ label, percentage }) => (
    <div className="space-y-2">
        <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{label}</span>
            <span className="text-sm font-medium text-muted-foreground">{percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
                className="bg-primary h-full transition-all duration-500 ease-out rounded-full"
                style={{ width: `${percentage}%` }}
            />
        </div>
    </div>
)

// --- Brand card ---
const BrandCard: React.FC<{ name: string; description?: string; image?: string; url?: string }> = ({
    name,
    description,
    image,
    url,
}) => {
    const imgSrc = image ? (image.startsWith("http") ? image : `/${image}`) : null

    const content = (
        <div className="border rounded-lg hover:shadow-lg transition-shadow bg-card overflow-hidden">
            <div className="p-6 text-center">
                <div className="w-full h-32 bg-muted rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                    {imgSrc ? (
                        <img src={imgSrc} alt={name} className="w-full h-full object-contain" />
                    ) : (
                        <span className="text-2xl font-bold text-muted-foreground">{name[0]}</span>
                    )}
                </div>
                <h3 className="font-semibold mb-2">{name}</h3>
                {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
        </div>
    )

    return url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block">
            {content}
        </a>
    ) : (
        content
    )
}

// --- Video card ---
const VideoCard: React.FC<{
    title: string
    description?: string
    duration: string
    url: string
    thumbnail?: string
}> = ({ title, description, duration, url, thumbnail }) => {
    const thumbSrc = thumbnail ? (thumbnail.startsWith("http") ? thumbnail : `/${thumbnail}`) : null

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-card block"
        >
            <div className="relative aspect-video bg-muted">
                {thumbSrc ? (
                    <img src={thumbSrc} alt={title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-lg text-muted-foreground">
                        No thumbnail
                    </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                        <div className="w-0 h-0 border-l-[16px] border-l-black border-y-[10px] border-y-transparent ml-1" />
                    </div>
                </div>

                <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {duration}
                </span>
            </div>

            <div className="p-4">
                <h3 className="font-semibold mb-2">{title}</h3>
                {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
        </a>
    )
}

// --- Speaker Icon ---
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

// --- Settings Icon ---
const SettingsIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

// --- Calculate score function ---
const calculateSustainabilityScore = (answers: string[]) => {
    let ecoScore = 0
    let longevityScore = 0
    let upcyclingScore = 0

    answers.forEach((answer) => {
        if (answer === "eco") {
            ecoScore += 33
            longevityScore += 33
            upcyclingScore += 33
        } else if (answer === "neutral") {
            ecoScore += 17
            longevityScore += 17
            upcyclingScore += 17
        }
    })

    const totalScore = Math.round((ecoScore + longevityScore + upcyclingScore) / 3)

    return {
        ecoFriendlyPurchases: Math.min(ecoScore, 100),
        wardrobeLongevity: Math.min(longevityScore, 100),
        upcyclingActivity: Math.min(upcyclingScore, 100),
        totalScore: Math.min(totalScore, 100),
    }
}

// --- Main page ---
const SustainabilityPage: React.FC = () => {
    const [answers, setAnswers] = useState({
        buyFrequency: "",
        brandType: "",
        upcyclingHabit: "",
    })

    const [scores, setScores] = useState({
        ecoFriendlyPurchases: 0,
        wardrobeLongevity: 0,
        upcyclingActivity: 0,
        totalScore: 0,
    })

    const [quizSubmitted, setQuizSubmitted] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false)
    
    const { settings } = useVoiceSettings();

    // Play intro voiceover when page loads
    useEffect(() => {
        const playIntro = async () => {
            setIsSpeaking(true);
            try {
                await speakSustainabilityIntro(
                    settings.selectedStylist.voiceId,
                    settings.selectedLanguage.code,
                    settings.volume,
                    settings.isMuted
                );
            } catch (err) {
                console.error("Voice error:", err);
            } finally {
                setIsSpeaking(false);
            }
        };

        playIntro();
    }, [settings.selectedStylist.voiceId, settings.selectedLanguage.code, settings.volume, settings.isMuted]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const answersArray = Object.values(answers)
        const result = calculateSustainabilityScore(answersArray)
        setScores(result)
        setQuizSubmitted(true)
    }

    return (
        <div className="min-h-screen bg-background">
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

            {/* Hero Section */}
            <section className="relative h-[400px] bg-white">
                <div className="relative container mx-auto px-6 h-full flex flex-col justify-center items-center text-center">
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4 text-balance">
                        Sustainability Hub
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl text-pretty">
                        Learn how to build a more sustainable wardrobe with eco-friendly tips, upcycling tutorials, and conscious
                        brand recommendations.
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-1 py-0 space-y-10">
                {/* Quiz Section */}
                <section id="quiz">
                    {!quizSubmitted ? (
                        <div className="max-w-2xl mx-auto">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold mb-3">Discover Your Sustainability Score</h2>
                                <p className="text-muted-foreground">
                                    Answer a few questions to learn about your fashion sustainability habits
                                </p>
                            </div>

                            <div className="border-2 border-primary/20 rounded-xl bg-card shadow-lg">
                                <div className="p-8 md:p-10">
                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        {/* Q1 */}
                                        <div className="space-y-3">
                                            <label className="block text-lg font-semibold">1. How often do you buy new clothes?</label>
                                            <select
                                                required
                                                value={answers.buyFrequency}
                                                onChange={(e) => setAnswers({ ...answers, buyFrequency: e.target.value })}
                                                className="w-full border-2 rounded-lg p-4 bg-background text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                            >
                                                <option value="">Select an option</option>
                                                <option value="eco">Rarely (few times a year)</option>
                                                <option value="neutral">Sometimes (monthly)</option>
                                                <option value="fast">Often (weekly)</option>
                                            </select>
                                        </div>

                                        {/* Q2 */}
                                        <div className="space-y-3">
                                            <label className="block text-lg font-semibold">2. Where do you usually shop?</label>
                                            <select
                                                required
                                                value={answers.brandType}
                                                onChange={(e) => setAnswers({ ...answers, brandType: e.target.value })}
                                                className="w-full border-2 rounded-lg p-4 bg-background text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                            >
                                                <option value="">Select an option</option>
                                                <option value="eco">Mostly sustainable brands (e.g., Patagonia, Reformation)</option>
                                                <option value="neutral">A mix of sustainable and fast fashion</option>
                                                <option value="fast">Mostly fast fashion</option>
                                            </select>
                                        </div>

                                        {/* Q3 */}
                                        <div className="space-y-3">
                                            <label className="block text-lg font-semibold">
                                                3. How often do you upcycle, thrift, or resell clothes?
                                            </label>
                                            <select
                                                required
                                                value={answers.upcyclingHabit}
                                                onChange={(e) => setAnswers({ ...answers, upcyclingHabit: e.target.value })}
                                                className="w-full border-2 rounded-lg p-4 bg-background text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                            >
                                                <option value="">Select an option</option>
                                                <option value="eco">Regularly</option>
                                                <option value="neutral">Occasionally</option>
                                                <option value="fast">Never</option>
                                            </select>
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-6 py-4 text-lg font-semibold transition-colors shadow-md hover:shadow-lg"
                                        >
                                            Calculate My Score
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto">
                            <div className="border rounded-lg bg-card shadow-sm">
                                <div className="p-8 md:p-12">
                                    <h2 className="text-3xl font-bold mb-8 text-center">Your Sustainability Score</h2>
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                                        <div className="flex-1 w-full space-y-6">
                                            <ProgressBar label="Eco-Friendly Purchases" percentage={scores.ecoFriendlyPurchases} />
                                            <ProgressBar label="Wardrobe Longevity" percentage={scores.wardrobeLongevity} />
                                            <ProgressBar label="Upcycling Activity" percentage={scores.upcyclingActivity} />
                                        </div>
                                        <div className="flex-shrink-0">
                                            <div className="w-48 h-48 rounded-full border-4 border-primary flex flex-col items-center justify-center">
                                                <span className="text-6xl font-bold">{scores.totalScore}</span>
                                                <span className="text-sm text-muted-foreground">out of 100</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setQuizSubmitted(false)}
                                        className="mt-8 w-full border border-input bg-transparent hover:bg-accent hover:text-accent-foreground rounded-lg px-4 py-2 font-medium transition-colors"
                                    >
                                        Retake Quiz
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* Upcycling Videos */}
                <section className="mb-20">
                    <h2 className="text-3xl font-bold text-center mb-8 tracking-tight">Upcycling Video Tutorials</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <VideoCard
                            title="5 Upcycling Projects for Beginners! | DIY Clothes Easy Sewing"
                            duration="8:21"
                            url="https://www.youtube.com/watch?v=zoMY4fJN1aU"
                            thumbnail="https://i.ytimg.com/vi/zoMY4fJN1aU/maxresdefault.jpg"
                        />
                        <VideoCard
                            title="UPCYCLING TUTORIAL: Button Up Dress Shirt to Flowy Summer Top | trashnfashn"
                            duration="6:42"
                            url="https://www.youtube.com/watch?v=KyDXE89Tyfo"
                            thumbnail="https://i.ytimg.com/vi/KyDXE89Tyfo/sddefault.jpg"
                        />
                        <VideoCard
                            title="How To Thrift Flip Clothes for BEGINNERS | Easy Step-by-Step Guide"
                            duration="16:55"
                            url="https://www.youtube.com/watch?v=_oqBPG_lDvc"
                            thumbnail="https://i.ytimg.com/vi/_oqBPG_lDvc/maxresdefault.jpg"
                        />
                    </div>
                </section>

                {/* Eco Brands */}
                <section>
                    <h2 className="text-3xl font-bold text-center mb-8 tracking-tight">Eco-Friendly Brands We ♡</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <BrandCard name="Patagonia" image="https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcSc5VfV21cVFXHomt2TWZFB1SS9RqtLor3MSxKoD_PnV4FdHH5z" url="https://www.patagonia.com" />
                        <BrandCard name="Everlane" image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIoRJ_ti0hhwqwZL7bLTVZpA8ZwYhn85XwWZNozsNf9T9-9KQd" url="https://www.everlane.com" />
                        <BrandCard name="Etsy" image="https://picklerooms.com/cdn/shop/articles/Etsy_21dfd081-e319-44ce-9541-eeccb1363f6f.png?v=1701902752" url="https://www.etsy.com" />
                        <BrandCard name="Allbirds" image="https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcThQCuLEUWLtzaD_zqio9LW-hDusO0jVuEFXOK9eKTFUXy1DiXl" url="https://www.allbirds.com" />
                    </div>
                </section>
            </div>
        </div>
    )
}

export default SustainabilityPage