"use client"

import { useMemo } from 'react'
import { Card, CardHeader, CardTitle, GradientText } from "@/components/ui/GlassCard"
import { cn, formatCurrency } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SpendingHeatmapProps {
    data: { date: Date; amount: number }[]
}

export function SpendingHeatmap({ data }: SpendingHeatmapProps) {
    // Process data into a map for fast lookup: "YYYY-MM-DD" -> amount
    const expensesMap = useMemo(() => {
        const map = new Map<string, number>()
        let max = 0
        data.forEach(item => {
            const dateStr = item.date.toISOString().split('T')[0]
            const current = map.get(dateStr) || 0
            const newTotal = current + item.amount
            map.set(dateStr, newTotal)
            if (newTotal > max) max = newTotal
        })
        return { map, max }
    }, [data])

    // Generate the last 365 days (or approx 52 weeks)
    const weeks = useMemo(() => {
        const weeksArray = []
        const today = new Date()
        // Ensure we end on today
        // We want 52 columns (weeks)
        const daysToRender = 52 * 7
        const startDate = new Date(today)
        startDate.setDate(today.getDate() - daysToRender)

        // Adjust start date to be a Sunday (or Monday based on preference, let's say Sun=0)
        // Actually GitHub graph usually starts with the day needed to align the grid.
        // Let's just generate strictly 365 days? Or 52 columns.
        // Let's iterate column by column.

        // Simpler: Generate array of Day objects, then chunk into weeks.
        const allDays = []
        for (let i = 0; i < daysToRender; i++) {
            const d = new Date(startDate)
            d.setDate(startDate.getDate() + i)
            allDays.push(d)
        }

        // Chunk into weeks (columns)
        // We need to be careful about alignment. 
        // GitHub's first column might be partial.
        // Let's simplified Grid: 7 rows (Sun-Sat), ~53 cols.
        // We render COLUMN-first.

        // Let's align startDate to the previous Sunday?
        const dayOfWeek = startDate.getDay()
        const alignedStartDate = new Date(startDate)
        alignedStartDate.setDate(startDate.getDate() - dayOfWeek) // Go back to Sunday

        const gridDays = []
        for (let i = 0; i < 53 * 7; i++) {
            const d = new Date(alignedStartDate)
            d.setDate(alignedStartDate.getDate() + i)
            gridDays.push(d)
        }

        // Now chunk into 53 weeks of 7 days
        const chunks = []
        for (let i = 0; i < gridDays.length; i += 7) {
            chunks.push(gridDays.slice(i, i + 7))
        }
        return chunks
    }, [])

    const getIntensity = (amount: number, max: number) => {
        if (amount === 0) return 0
        const ratio = amount / max
        if (ratio < 0.25) return 1
        if (ratio < 0.5) return 2
        if (ratio < 0.75) return 3
        return 4
    }

    return (
        <Card className="p-6 h-full flex flex-col">
            <CardHeader className="px-0 pt-0 mb-4">
                <CardTitle>Spending Consistency</CardTitle>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <span>Less</span>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-sm bg-white/5" />
                        <div className="w-3 h-3 rounded-sm bg-emerald-500/30" />
                        <div className="w-3 h-3 rounded-sm bg-emerald-500/50" />
                        <div className="w-3 h-3 rounded-sm bg-emerald-500/80" />
                        <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                    </div>
                    <span>More</span>
                </div>
            </CardHeader>
            <div className="flex-1 overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex gap-1 min-w-max">
                    {weeks.map((week, wIdx) => (
                        <div key={wIdx} className="flex flex-col gap-1">
                            {week.map((day, dIdx) => {
                                const dateStr = day.toISOString().split('T')[0]
                                const amount = expensesMap.map.get(dateStr) || 0
                                const intensity = getIntensity(amount, expensesMap.max)
                                const isToday = dateStr === new Date().toISOString().split('T')[0]

                                return (
                                    <TooltipProvider key={dateStr}>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <div
                                                    className={cn(
                                                        "w-3 h-3 rounded-sm transition-colors",
                                                        intensity === 0 && "bg-white/5 hover:bg-white/10",
                                                        intensity === 1 && "bg-emerald-900/40 hover:bg-emerald-900/60",
                                                        intensity === 2 && "bg-emerald-700/50 hover:bg-emerald-700/70",
                                                        intensity === 3 && "bg-emerald-500/60 hover:bg-emerald-500/80",
                                                        intensity === 4 && "bg-emerald-500 hover:bg-emerald-400",
                                                        isToday && "ring-1 ring-white"
                                                    )}
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-neutral-900 border border-white/10 text-xs">
                                                <p className="font-bold">{dateStr}</p>
                                                <p>{amount > 0 ? formatCurrency(amount) : 'No spending'}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    )
}
