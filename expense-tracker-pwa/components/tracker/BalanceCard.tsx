
"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface BalanceCardProps {
    income: number;
    expense: number;
    balance: number;
}

export function BalanceCard({ income, expense, balance }: BalanceCardProps) {
    return (
        <GlassCard gradient className="p-6 mb-8" suppressHydrationWarning>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" suppressHydrationWarning>
                {/* Balance */}
                <div className="flex items-center gap-4 md:border-r border-white/10 pr-6" suppressHydrationWarning>
                    <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-neutral-400 uppercase tracking-wider">Balance</p>
                        <p className="text-2xl font-bold font-mono text-white">{formatCurrency(balance)}</p>
                    </div>
                </div>

                {/* Income */}
                <div className="flex items-center gap-4 md:border-r border-white/10 pr-6" suppressHydrationWarning>
                    <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-neutral-400 uppercase tracking-wider">Income</p>
                        <p className="text-xl font-bold font-mono text-emerald-400">{formatCurrency(income)}</p>
                    </div>
                </div>

                {/* Expense */}
                <div className="flex items-center gap-4" suppressHydrationWarning>
                    <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400">
                        <TrendingDown size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-neutral-400 uppercase tracking-wider">Expenses</p>
                        <p className="text-xl font-bold font-mono text-rose-400">{formatCurrency(expense)}</p>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
}
