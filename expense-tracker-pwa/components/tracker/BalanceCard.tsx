
"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Wallet, Eye, EyeOff } from "lucide-react";
import React from 'react';

interface BalanceCardProps {
    income: number;
    expense: number;
    balance: number;
}

export function BalanceCard({ income, expense, balance }: BalanceCardProps) {
    const [isPrivate, setIsPrivate] = React.useState(false);

    React.useEffect(() => {
        const saved = localStorage.getItem("privacy_mode");
        if (saved) setIsPrivate(saved === "true");
    }, []);

    const togglePrivacy = () => {
        const newState = !isPrivate;
        setIsPrivate(newState);
        localStorage.setItem("privacy_mode", String(newState));
    };

    const displayAmount = (amount: number) => isPrivate ? "••••" : formatCurrency(amount);

    return (
        <GlassCard gradient className="p-6 mb-8" suppressHydrationWarning>
            <div className="absolute right-4 top-4 z-10">
                <button
                    onClick={togglePrivacy}
                    className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                    {isPrivate ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" suppressHydrationWarning>
                {/* Balance */}
                <div className="flex items-center gap-4 md:border-r border-white/10 pr-6" suppressHydrationWarning>
                    <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-neutral-400 uppercase tracking-wider">Balance</p>
                        <p className="text-2xl font-bold font-mono text-white">{displayAmount(balance)}</p>
                    </div>
                </div>

                {/* Income */}
                <div className="flex items-center gap-4 md:border-r border-white/10 pr-6" suppressHydrationWarning>
                    <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-neutral-400 uppercase tracking-wider">Income</p>
                        <p className="text-xl font-bold font-mono text-emerald-400">{displayAmount(income)}</p>
                    </div>
                </div>

                {/* Expense */}
                <div className="flex items-center gap-4" suppressHydrationWarning>
                    <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400">
                        <TrendingDown size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-neutral-400 uppercase tracking-wider">Expenses</p>
                        <p className="text-xl font-bold font-mono text-rose-400">{displayAmount(expense)}</p>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
}
