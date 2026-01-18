'use client'

import { useState } from 'react'
import { Sparkles, RefreshCw } from 'lucide-react'
import { getSpendingInsights } from '@/app/actions/ai'
import { GlassCard } from '@/components/ui/GlassCard'
import { cn } from '@/lib/utils'

export function InsightsCard() {
    const [insight, setInsight] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleGenerate() {
        setLoading(true)
        setError(null)
        const res = await getSpendingInsights()

        if (res.error) {
            setError(res.error)
        } else {
            setInsight(res.insight || "No insights available.")
        }
        setLoading(false)
    }

    return (
        <GlassCard className="p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity" suppressHydrationWarning>
                <Sparkles size={100} />
            </div>

            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Sparkles className="text-yellow-400" size={20} />
                AI Financial Insights
            </h3>

            <div className="min-h-[100px] flex flex-col justify-center">
                {error ? (
                    <p className="text-red-400 text-sm bg-red-950/20 p-3 rounded-lg border border-red-500/20">
                        {error}
                        {error.includes("Key is missing") && (
                            <span className="block mt-1 text-xs text-red-500/70">
                                Please add GOOGLE_API_KEY to your .env file.
                            </span>
                        )}
                    </p>
                ) : loading ? (
                    <div className="space-y-2 animate-pulse">
                        <div className="h-4 bg-white/10 rounded w-3/4"></div>
                        <div className="h-4 bg-white/10 rounded w-full"></div>
                        <div className="h-4 bg-white/10 rounded w-5/6"></div>
                    </div>
                ) : insight ? (
                    <div className="prose prose-invert prose-sm">
                        <p className="text-neutral-300 leading-relaxed whitespace-pre-line">
                            {insight}
                        </p>
                    </div>
                ) : (
                    <div className="text-center text-neutral-400 text-sm">
                        <p>Get personalized tips based on your spending habits.</p>
                    </div>
                )}
            </div>

            <div className="mt-6">
                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className={cn(
                        "w-full py-2 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2",
                        insight
                            ? "bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/5"
                            : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-lg shadow-purple-500/20"
                    )}
                >
                    {loading ? (
                        <>
                            <RefreshCw size={16} className="animate-spin" /> Analyzing...
                        </>
                    ) : (
                        <>
                            <Sparkles size={16} /> {insight ? 'Refresh Insights' : 'Generate Insights'}
                        </>
                    )}
                </button>
            </div>
        </GlassCard>
    )
}
