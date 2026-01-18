
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency, cn } from "@/lib/utils";
import { ChevronDown, Pencil, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { DeleteButton } from "@/components/DeleteButton";
import Link from "next/link";
import { Investment } from "@prisma/client";

interface InvestmentGroupProps {
    title: string;
    type: string;
    isStock: boolean;
    ticker?: string | null;
    totalValue: number;
    totalInvested: number;
    dayPnL: number;
    totalPnL: number;
    totalPnLPercent: number;
    investments: any[]; // Enriched investment objects
}

export function InvestmentGroup({
    title,
    type,
    isStock,
    ticker,
    totalValue,
    totalInvested,
    dayPnL,
    totalPnL,
    totalPnLPercent,
    investments
}: InvestmentGroupProps) {
    const [expanded, setExpanded] = useState(false);

    // Calculate aggregate metrics
    const avgCost = totalInvested > 0 ? totalInvested / investments.reduce((acc, inv) => acc + (inv.currentUnits || inv.quantity || 0), 0) : 0;

    // Use the latest price from the first investment (sorted by date)
    const latestPrice = investments[0]?.currentPrice || 0;
    const latestChangePercent = investments[0]?.changePercent || 0;

    return (
        <GlassCard className="group relative overflow-hidden transition-all duration-300" suppressHydrationWarning>
            {/* Header / Summary View */}
            <div
                className="p-5 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
                suppressHydrationWarning
            >
                <div className="flex justify-between items-start" suppressHydrationWarning>
                    <div className="flex items-center gap-4" suppressHydrationWarning>
                        {/* Icon/Avatar Placeholder */}
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/10 flex items-center justify-center shrink-0">
                            {isStock ? (
                                <TrendingUp className="text-emerald-500" size={20} />
                            ) : type === 'FD' ? (
                                <div className="text-amber-500 font-bold text-xs flex flex-col items-center">
                                    <span className="text-[8px] uppercase">Bank</span>
                                    FD
                                </div>
                            ) : (
                                <Wallet className="text-blue-500" size={20} />
                            )}
                        </div>

                        <div>
                            <div className="flex items-baseline gap-2" suppressHydrationWarning>
                                <h3 className="font-semibold text-lg text-white leading-none">{title}</h3>
                                {ticker && <span className="text-xs text-neutral-500 font-mono hidden md:inline-block">{ticker}</span>}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1" suppressHydrationWarning>
                                <span className={cn(
                                    "px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider",
                                    isStock ? "bg-emerald-500/10 text-emerald-400" : type === 'FD' ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-400"
                                )}>
                                    {type === 'FD' ? 'Fixed Deposit' : type}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="text-right z-10 pl-2" suppressHydrationWarning>
                        <div className="text-xl font-bold font-mono text-white tracking-tight" suppressHydrationWarning>
                            {formatCurrency(totalValue)}
                        </div>
                        <div className={cn("text-xs flex items-center justify-end gap-1 mt-0.5 font-medium",
                            dayPnL >= 0 ? "text-emerald-400" : "text-rose-400"
                        )} suppressHydrationWarning>
                            {type !== 'FD' && (
                                <>
                                    {dayPnL >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                    {formatCurrency(Math.abs(dayPnL))} ({dayPnL >= 0 ? '+' : ''}{((dayPnL / (totalValue - dayPnL)) * 100).toFixed(2)}%)
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mini Stats Grid (Visible when collapsed) */}
                {!expanded && (
                    <div className="flex items-center justify-between mt-4 pl-[4rem] text-xs transition-opacity duration-300" suppressHydrationWarning>
                        <div className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar" suppressHydrationWarning>
                            <div suppressHydrationWarning>
                                <span className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-0.5">Invested</span>
                                <span className="font-mono text-neutral-300">{formatCurrency(totalInvested)}</span>
                            </div>
                            <div suppressHydrationWarning>
                                <span className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-0.5">Returns</span>
                                <span className={cn("font-mono", totalPnL >= 0 ? "text-emerald-400" : "text-rose-400")}>
                                    {totalPnL >= 0 ? "+" : ""}{formatCurrency(totalPnL)}
                                </span>
                            </div>

                            <div suppressHydrationWarning>
                                <span className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-0.5">{isStock ? "Curr Price" : type === 'FD' ? "Interest" : "NAV"}</span>
                                <span className="font-mono text-neutral-300">
                                    {type === 'FD' ? (
                                        <span className="text-amber-400">{investments[0]?.interestRate}%</span>
                                    ) : (
                                        <>
                                            {latestPrice > 0 ? `₹${latestPrice.toFixed(2)}` : 'N/A'}
                                            <span className={cn("ml-1", latestChangePercent >= 0 ? "text-emerald-500" : "text-rose-500")}>
                                                ({latestChangePercent.toFixed(2)}%)
                                            </span>
                                        </>
                                    )}
                                </span>
                            </div>
                        </div>
                        <ChevronDown className="text-neutral-600" size={16} />
                    </div>
                )}
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden bg-white/5 border-t border-white/5"
                        suppressHydrationWarning
                    >
                        <div className="p-5 pl-4 md:pl-[4rem]" suppressHydrationWarning>
                            {/* Expanded Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-6" suppressHydrationWarning>
                                <div suppressHydrationWarning>
                                    <span className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">Total Returns</span>
                                    <div className={cn("text-lg font-mono font-medium", totalPnL >= 0 ? "text-emerald-400" : "text-rose-400")}>
                                        {totalPnL >= 0 ? "+" : ""}{formatCurrency(totalPnL)}
                                        <span className="text-xs ml-1 opacity-70">({totalPnLPercent.toFixed(2)}%)</span>
                                    </div>
                                </div>
                                <div suppressHydrationWarning>
                                    <span className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">{isStock ? "Buy Price" : type === 'FD' ? "Avg Interest" : "Avg NAV"}</span>
                                    <div className="text-lg font-mono font-medium text-white">
                                        {type === 'FD' ? (
                                            <span className="text-amber-400">{investments[0]?.interestRate}%</span>
                                        ) : formatCurrency(avgCost)}
                                    </div>
                                </div>
                            </div>

                            {/* Transaction History Table */}
                            <div className="space-y-1" suppressHydrationWarning>
                                <h4 className="text-[10px] uppercase tracking-wider text-neutral-400 mb-3 font-semibold">Helpers</h4>

                                {/* Table Header */}
                                <div className="grid grid-cols-12 text-[10px] uppercase tracking-wider text-neutral-600 px-3 pb-1 border-b border-white/5" suppressHydrationWarning>
                                    <div className="col-span-3">Date</div>
                                    <div className="col-span-2 text-right">{isStock ? "Qty" : type === 'FD' ? "Tenure" : "Units"}</div>
                                    <div className="col-span-3 text-right">{isStock ? "Buy Price" : type === 'FD' ? "Maturity" : "Avg NAV"}</div>
                                    <div className="col-span-3 text-right">Invested</div>
                                    <div className="col-span-1 text-right"></div>
                                </div>

                                {investments.map((inv) => {
                                    const units = inv.currentUnits || inv.quantity || 0;
                                    const invested = inv.currentInvestedAmount || inv.amount;
                                    const avgPrice = inv.averageBuyPrice || (units > 0 ? invested / units : 0);

                                    return (
                                        <div key={inv.id} className="grid grid-cols-12 items-center px-3 py-2 rounded-lg hover:bg-white/5 transition text-sm" suppressHydrationWarning>
                                            <div className="col-span-3 flex flex-col">
                                                <span className="text-neutral-300 font-medium">{new Date(inv.startDate).toLocaleDateString()}</span>
                                                {inv.type === 'FD' ? (
                                                    <span className="text-[10px] text-amber-500 uppercase font-bold">{inv.interestRate}% PA</span>
                                                ) : (
                                                    <span className="text-[10px] text-neutral-500 uppercase">{inv.type}</span>
                                                )}
                                            </div>
                                            <div className="col-span-2 text-right font-mono text-neutral-400">
                                                {inv.type === 'FD' ? '-' : units.toFixed(2)}
                                            </div>
                                            <div className="col-span-3 text-right font-mono text-neutral-400">
                                                {inv.type === 'FD' && inv.maturityDate ? (
                                                    new Date(inv.maturityDate).toLocaleDateString()
                                                ) : formatCurrency(avgPrice)}
                                            </div>
                                            <div className="col-span-3 text-right font-mono text-neutral-300">
                                                {formatCurrency(invested)}
                                            </div>
                                            <div className="col-span-1 flex justify-end gap-2 opacity-60 hover:opacity-100 transition-opacity">
                                                <Link href={`/investments/${inv.id}/edit`} className="text-neutral-400 hover:text-white transition p-1">
                                                    <Pencil size={12} />
                                                </Link>
                                                <DeleteButton id={inv.id} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </GlassCard>
    );
}
