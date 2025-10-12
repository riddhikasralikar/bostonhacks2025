"use client"

import React, { useState } from "react"

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const answersArray = Object.values(answers)
        const result = calculateSustainabilityScore(answersArray)
        setScores(result)
        setQuizSubmitted(true)
    }

    return (
        <div className="min-h-screen bg-background">
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
                            thumbnail="picture-1.png"
                        />
                        <VideoCard
                            title="UPCYCLING TUTORIAL: Button Up Dress Shirt to Flowy Summer Top | trashnfashn"
                            duration="6:42"
                            url="https://www.youtube.com/watch?v=KyDXE89Tyfo"
                            thumbnail="picture-3.png"
                        />
                        <VideoCard
                            title="How To Thrift Flip Clothes for BEGINNERS | Easy Step-by-Step Guide"
                            duration="16:55"
                            url="https://www.youtube.com/watch?v=_oqBPG_lDvc"
                            thumbnail="picture-2.png"
                        />
                    </div>
                </section>

                {/* Eco Brands */}
                <section>
                    <h2 className="text-3xl font-bold text-center mb-8 tracking-tight">Eco-Friendly Brands We ♡</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <BrandCard name="Patagonia" image="Patagonia-Logo-Old.png" url="https://www.patagonia.com" />
                        <BrandCard name="Everlane" image="everlane_logo.jpg" url="https://www.everlane.com" />
                        <BrandCard name="Etsy" image="Etsy-Emblem.png" url="https://www.etsy.com" />
                        <BrandCard name="Allbirds" image="OIP.webp" url="https://www.allbirds.com" />
                    </div>
                </section>
            </div>
        </div>
    )
}

export default SustainabilityPage