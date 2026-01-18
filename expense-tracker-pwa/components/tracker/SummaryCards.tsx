
"use client";
import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, PiggyBank, Wallet, Eye, EyeOff } from "lucide-react";

interface SummaryCardsProps {
    income: number;
    expense: number;
    balance: number;
    savingsRate: number;
    totalWalletBalance: number;
}

export function SummaryCards({ income, expense, balance, savingsRate, totalWalletBalance }: SummaryCardsProps) {
    const [showBalance, setShowBalance] = useState(false);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" suppressHydrationWarning>
            {/* Wallet Balance Card (Gold) */}
            <GlassCard className="p-6 relative group overflow-hidden border-yellow-500/20 bg-yellow-950/10" suppressHydrationWarning>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition" suppressHydrationWarning>
                    <Wallet size={80} className="text-yellow-500" />
                </div>
                <div suppressHydrationWarning>
                    <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs text-yellow-500 uppercase tracking-wider font-bold">Total Wallet Balance</p>
                        <button
                            onClick={() => setShowBalance(!showBalance)}
                            className="text-yellow-500/50 hover:text-yellow-400 transition relative z-50 p-1 hover:bg-yellow-500/10 rounded"
                            type="button"
                        >
                            {showBalance ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                    </div>
                    <p className="text-2xl font-bold text-yellow-400 tracking-tight">
                        {showBalance ? formatCurrency(totalWalletBalance) : "••••••"}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-yellow-600/80" suppressHydrationWarning>
                        <div className="h-1.5 w-1.5 rounded-full bg-yellow-500"></div>
                        <span>All Time Available</span>
                    </div>
                </div>
            </GlassCard>
            {/* Income Card */}
            <GlassCard className="p-6 relative group overflow-hidden" suppressHydrationWarning>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition" suppressHydrationWarning>
                    <TrendingUp size={80} className="text-emerald-500" />
                </div>
                <div suppressHydrationWarning>
                    <p className="text-xs text-neutral-400 uppercase tracking-wider font-medium mb-1">Total Income</p>
                    <p className="text-2xl font-bold text-white tracking-tight">{formatCurrency(income)}</p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400" suppressHydrationWarning>
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
                        <span>Cash Inflow</span>
                    </div>
                </div>
            </GlassCard>

            {/* Expense Card */}
            <GlassCard className="p-6 relative group overflow-hidden" suppressHydrationWarning>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition" suppressHydrationWarning>
                    <TrendingDown size={80} className="text-rose-500" />
                </div>
                <div suppressHydrationWarning>
                    <p className="text-xs text-neutral-400 uppercase tracking-wider font-medium mb-1">Total Expenses</p>
                    <p className="text-2xl font-bold text-white tracking-tight">{formatCurrency(expense)}</p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-rose-400" suppressHydrationWarning>
                        <div className="h-1.5 w-1.5 rounded-full bg-rose-400"></div>
                        <span>Cash Outflow</span>
                    </div>
                </div>
            </GlassCard>

            {/* Savings Card */}
            <GlassCard className="p-6 relative group overflow-hidden" suppressHydrationWarning>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition" suppressHydrationWarning>
                    <PiggyBank size={80} className="text-blue-400" />
                </div>
                <div suppressHydrationWarning>
                    <p className="text-xs text-neutral-400 uppercase tracking-wider font-medium mb-1">Net Savings</p>
                    <p className={`text-2xl font-bold tracking-tight ${balance >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
                        {formatCurrency(balance)}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-neutral-400" suppressHydrationWarning>
                        <span className="bg-white/10 px-2 py-0.5 rounded text-white font-mono">
                            {savingsRate.toFixed(1)}%
                        </span>
                        <span>Savings Rate</span>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}
