'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Share2, ChevronRight, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

interface StoryData {
    year: number
    totalSpent: number
    totalIncome: number
    savingsRate: number
    topCategory: string
    topCategoryAmount: number
    isPartyAnimal: boolean
    persona: string
    personaDescription: string
    personaEmoji: string
}

const COLORS = [
    'from-indigo-600 to-violet-900', // Intro
    'from-rose-600 to-pink-900',     // Total Spent
    'from-amber-500 to-orange-900',  // Top Category
    'from-emerald-600 to-teal-900',  // Persona
]

export function WrappedStory({ data }: { data: StoryData }) {
    const [index, setIndex] = useState(0)
    const totalSlides = 4

    const nextSlide = () => {
        if (index < totalSlides - 1) setIndex(index + 1)
    }

    const prevSlide = () => {
        if (index > 0) setIndex(index - 1)
    }

    const shareStory = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'My WealthWrapped 2026',
                    text: `I'm a "${data.persona}" ${data.personaEmoji}! I spent ${formatCurrency(data.totalSpent)} this year. Check your financial personality on WealthNest!`,
                    url: window.location.href
                })
            } else {
                alert("Copied to clipboard!")
                await navigator.clipboard.writeText(`I'm a "${data.persona}" ${data.personaEmoji}! Check WealthNest!`)
            }
        } catch (err) {
            console.error('Error sharing', err)
        }
    }

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') nextSlide()
            if (e.key === 'ArrowLeft') prevSlide()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [index])

    return (
        <div className={`relative w-full h-full md:max-w-md md:h-[800px] md:rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br ${COLORS[index]} transition-colors duration-700`}>

            {/* Progress Bar */}
            <div className="absolute top-4 left-0 right-0 z-50 flex gap-1 px-4">
                {Array.from({ length: totalSlides }).map((_, i) => (
                    <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: i <= index ? "100%" : "0%" }}
                            className="h-full bg-white"
                        />
                    </div>
                ))}
            </div>

            {/* Header Controls */}
            <div className="absolute top-8 left-4 right-4 z-50 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-sm opacity-80">WealthWrapped</span>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">{data.year}</span>
                </div>
                <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-full transition">
                    <X size={24} />
                </Link>
            </div>

            {/* Slide Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.1, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-white"
                    onClick={(e) => {
                        // Simple tap navigation: Right side = Next, Left side = Prev
                        const width = e.currentTarget.offsetWidth
                        const x = e.clientX - e.currentTarget.getBoundingClientRect().left
                        if (x > width / 2) nextSlide()
                        else prevSlide()
                    }}
                >
                    {/* SLIDE 1: INTRO */}
                    {index === 0 && (
                        <>
                            <h1 className="text-5xl font-black mb-4 tracking-tighter">Ready for your<br />Money Story? 🎬</h1>
                            <p className="text-xl opacity-80">It's been a wild year for your wallet.</p>
                            <p className="mt-8 text-sm opacity-60 animate-pulse">Tap to continue</p>
                        </>
                    )}

                    {/* SLIDE 2: TOTAL SPENT */}
                    {index === 1 && (
                        <>
                            <p className="text-lg opacity-80 uppercase tracking-widest mb-4">Total Spent</p>
                            <h2 className="text-6xl font-black mb-6 tracking-tighter break-all">
                                {formatCurrency(data.totalSpent)}
                            </h2>
                            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md">
                                <p className="text-sm opacity-90">
                                    That's enough to buy <span className="font-bold text-yellow-300">{(data.totalSpent / 250).toFixed(0)} Coffees</span> ☕
                                </p>
                            </div>
                            <p className="mt-4 text-sm opacity-60">
                                Savings Rate: <span className="font-bold">{data.savingsRate}%</span>
                            </p>
                        </>
                    )}

                    {/* SLIDE 3: TOP CATEGORY */}
                    {index === 2 && (
                        <>
                            <p className="text-lg opacity-80 uppercase tracking-widest mb-4">Your Guilty Pleasure</p>
                            <div className="text-9xl mb-6">
                                {data.topCategory === 'Food' ? '🍕' :
                                    data.topCategory === 'Transport' ? '🚕' :
                                        data.topCategory === 'Shopping' ? '🛍️' : '💸'
                                }
                            </div>
                            <h2 className="text-4xl font-bold mb-2">{data.topCategory}</h2>
                            <p className="text-2xl opacity-90">{formatCurrency(data.topCategoryAmount)}</p>
                            <p className="mt-8 text-sm opacity-70 italic">
                                {data.isPartyAnimal ? "You spent more on Weekends! 🎉" : "You were consistent on Weekdays. 💼"}
                            </p>
                        </>
                    )}

                    {/* SLIDE 4: PERSONA */}
                    {index === 3 && (
                        <>
                            <p className="text-lg opacity-80 uppercase tracking-widest mb-2">Your Money Aura</p>
                            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-6xl mb-6 shadow-xl animate-bounce">
                                {data.personaEmoji}
                            </div>
                            <h1 className="text-4xl font-black mb-4 uppercase text-yellow-300 drop-shadow-lg">
                                {data.persona}
                            </h1>
                            <p className="text-xl font-medium leading-relaxed max-w-xs opacity-90">
                                {data.personaDescription}
                            </p>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    shareStory()
                                }}
                                className="mt-12 flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold shadow-lg active:scale-95 transition-transform"
                            >
                                <Share2 size={18} /> Share Story
                            </button>
                        </>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Navigation Hints (Desktop) */}
            <div className="hidden md:flex absolute top-1/2 w-full justify-between px-4 pointer-events-none">
                <button onClick={prevSlide} className={`p-2 rounded-full bg-white/10 pointer-events-auto hover:bg-white/20 transition ${index === 0 ? 'opacity-0' : 'opacity-100'}`}>
                    <ChevronLeft size={24} color="white" />
                </button>
                <button onClick={nextSlide} className={`p-2 rounded-full bg-white/10 pointer-events-auto hover:bg-white/20 transition ${index === totalSlides - 1 ? 'opacity-0' : 'opacity-100'}`}>
                    <ChevronRight size={24} color="white" />
                </button>
            </div>
        </div>
    )
}
