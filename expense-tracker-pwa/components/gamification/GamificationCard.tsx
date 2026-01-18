'use client'

import { Medal, Flame, TrendingUp, PiggyBank, Crown, Lock } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { cn } from '@/lib/utils'

interface GamificationProps {
    streak: number
    savingsRate: number
    totalInvested: number
    transactionCount: number
    netWorth: number
}

export function GamificationCard({ savingsRate, totalInvested, transactionCount, netWorth }: { savingsRate: number, totalInvested: number, transactionCount: number, netWorth: number }) {

    // --- Badge Logic ---
    const badges = [
        {
            id: 'novice',
            name: 'Novice Tracker',
            icon: TrendingUp,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            locked: transactionCount < 1,
            requirement: 'Add 1st transaction'
        },
        {
            id: 'saver',
            name: 'Super Saver',
            icon: PiggyBank,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            locked: savingsRate < 20,
            requirement: 'Save 20% of Income'
        },
        {
            id: 'investor',
            name: 'Future Millionaire',
            icon: Medal,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            locked: totalInvested < 10000,
            requirement: 'Invest ₹10k'
        },
        {
            id: 'wealth_lord',
            name: 'Wealth Lord',
            icon: Crown,
            color: 'text-yellow-400',
            bg: 'bg-yellow-500/10',
            locked: netWorth < 100000,
            requirement: 'Net Worth ₹1 Lakh'
        }
    ]

    // --- Level Logic (XP) ---
    // 1 Transaction = 50 XP. Max Level = Infinite.
    // Level = Math.floor(TotalXP / 1000) + 1
    const totalXP = (transactionCount * 50) + (totalInvested > 0 ? 500 : 0)
    const level = Math.floor(totalXP / 1000) + 1
    const progress = ((totalXP % 1000) / 1000) * 100

    return (
        <GlassCard className="p-6 relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Crown className="text-yellow-400" />
                        Level {level}
                    </h3>
                    <p className="text-neutral-400 text-xs">Total XP: {totalXP}</p>
                </div>
                {/* Streak Removed as per user request to avoid negative spending incentive */}
            </div>

            {/* XP Bar */}
            <div className="w-full h-2 bg-white/10 rounded-full mb-6 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-4 gap-2">
                {badges.map(badge => (
                    <div
                        key={badge.id}
                        className={cn(
                            "flex flex-col items-center justify-center p-2 rounded-xl border transition-all relative group",
                            badge.locked
                                ? "bg-white/5 border-white/5 opacity-50 grayscale"
                                : `${badge.bg} border-white/10 hover:scale-105 hover:bg-white/10`
                        )}
                        title={badge.locked ? `Locked: ${badge.requirement}` : badge.name}
                    >
                        {badge.locked && (
                            <div className="absolute inset-0 flex items-center justify-center z-10">
                                <Lock size={12} className="text-neutral-500" />
                            </div>
                        )}
                        <badge.icon size={20} className={cn("mb-1", badge.color)} />
                        <span className="text-[9px] text-center font-bold text-neutral-300 hidden md:block">{badge.name}</span>
                    </div>
                ))}
            </div>

            <p className="text-[10px] text-neutral-600 text-center mt-4">
                Keep tracking to unlock more badges! 🏆
            </p>
        </GlassCard>
    )
}
