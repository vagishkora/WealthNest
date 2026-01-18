"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { formatCurrency, cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Activity, List, Calendar } from "lucide-react";
import Link from "next/link";
import { GlassModal } from "@/components/ui/GlassModal";

interface BentoCardProps {
    id?: string;
    title: string;
    type: string;
    isStock: boolean;
    ticker?: string | null;
    totalValue: number;
    totalInvested: number;
    dayPnL: number;
    totalPnL: number;
    totalPnLPercent: number;
    variant?: "hero" | "featured" | "standard";
    latestPrice?: number;
    quantity?: number;
    lots?: any[]; // Array of individual purchases
}

export function BentoCard({
    id,
    title,
    type,
    isStock,
    ticker,
    totalValue,
    totalInvested,
    dayPnL,
    totalPnL,
    totalPnLPercent,
    variant = "standard",
    latestPrice,
    quantity,
    lots = []
}: BentoCardProps) {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const isPositive = totalPnL >= 0;
    const isDayPositive = dayPnL >= 0;

    // Grid sizing classes based on variant
    const sizeClasses = {
        hero: "md:col-span-2 md:row-span-2 min-h-[300px]",
        featured: "md:col-span-1 md:row-span-1 min-h-[180px]",
        standard: "md:col-span-1 md:row-span-1 min-h-[180px]"
    };

    const handleOpenDetails = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent Link navigation
        e.stopPropagation();
        setIsDetailsOpen(true);
    };

    return (
        <>
            <motion.div
                layoutId={id}
                className={cn(
                    "group relative overflow-hidden rounded-3xl transition-all duration-300",
                    "bg-neutral-900/40 backdrop-blur-xl border border-white/5",
                    "hover:bg-neutral-800/60 hover:border-white/10 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1",
                    sizeClasses[variant],
                    variant === "featured" && isPositive && "border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]", // Green glow for winners
                    variant === "featured" && !isPositive && "border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.1)]" // Red glow for losers
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.98 }}
            >
                {/* Background Gradient Blob for visual interest */}
                <div className={cn(
                    "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px] opacity-20 transition-opacity duration-500 group-hover:opacity-40",
                    isPositive ? "bg-emerald-500" : "bg-rose-500"
                )} />

                <Link href={id ? `/investments/${id}/edit` : '#'} className="block h-full w-full p-5 flex flex-col justify-between relative z-10">

                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div className="flex gap-3 items-center">
                            <div className={cn(
                                "h-10 w-10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/5",
                                isStock ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"
                            )}>
                                {isStock ? <Activity size={18} /> : <Wallet size={18} />}
                            </div>
                            <div>
                                <h3 className={cn("font-bold text-white leading-tight", variant === 'hero' ? 'text-2xl' : 'text-sm')}>
                                    {title}
                                </h3>
                                <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium mt-0.5">
                                    {ticker || type}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Breakdown Button */}
                            {lots.length > 1 && (
                                <button
                                    onClick={handleOpenDetails}
                                    className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-neutral-400 hover:text-white"
                                    title="View Holdings Breakdown"
                                >
                                    <List size={14} />
                                </button>
                            )}

                            {variant === 'hero' && (
                                <div className="px-3 py-1 bg-white/5 rounded-full border border-white/5 backdrop-blur-sm">
                                    <span className="text-xs text-neutral-300 font-mono">LARGEST HOLDING</span>
                                </div>
                            )}
                            {variant === 'featured' && (
                                <div className="px-2 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20">
                                    <span className="text-[10px] text-emerald-400 font-bold uppercase">Top Gainer</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Value */}
                    <div className="mt-4">
                        <p className="text-xs text-neutral-500 font-medium mb-1">Current Value</p>
                        <h2 className={cn(
                            "font-mono font-bold text-white tracking-tight",
                            variant === 'hero' ? "text-5xl" : "text-2xl"
                        )}>
                            {formatCurrency(totalValue)}
                        </h2>
                    </div>

                    {/* Footer Metrics */}
                    <div className="mt-auto pt-4 border-t border-white/5 flex items-end justify-between">
                        <div>
                            <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Total Returns</p>
                            <div className={cn("flex items-center gap-1 font-mono font-medium", isPositive ? "text-emerald-400" : "text-rose-400")}>
                                {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                <span>{formatCurrency(Math.abs(totalPnL))}</span>
                                <span className="text-xs opacity-80">({totalPnLPercent.toFixed(2)}%)</span>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Today</p>
                            <div className={cn("flex items-center justify-end gap-1 font-mono text-xs", isDayPositive ? "text-emerald-400" : "text-rose-400")}>
                                {isDayPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {formatCurrency(Math.abs(dayPnL))}
                            </div>
                        </div>
                    </div>
                </Link>
            </motion.div>

            {/* Breakdown Modal */}
            <GlassModal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                title={`Holdings: ${title}`}
                className="max-w-md"
            >
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-neutral-500 uppercase tracking-wider px-2">
                        <span>Date</span>
                        <div className="flex gap-8">
                            <span>Qty</span>
                            <span className="w-16 text-right">Price</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {lots.map((lot, idx) => (
                            <div key={lot.id || idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-500">
                                        <Calendar size={14} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-white">
                                            {lot.startDate ? new Date(lot.startDate).toLocaleDateString() : 'Unknown Date'}
                                        </span>
                                        <span className="text-[10px] text-neutral-500 uppercase">{lot.type}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8 text-right">
                                    <span className="font-mono text-sm text-neutral-300">
                                        {lot.quantity || lot.currentUnits || 0}
                                    </span>
                                    <span className="font-mono text-sm text-white w-16">
                                        {formatCurrency(lot.avgPrice || (lot.amount / (lot.quantity || lot.currentUnits || 1)))}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center px-2">
                        <span className="text-neutral-400 text-sm">Total Average</span>
                        <div className="text-right">
                            <p className="text-xs text-neutral-500">Avg. Buy Price</p>
                            <p className="text-lg font-bold font-mono text-white">
                                {formatCurrency(totalInvested / (quantity || 1))}
                            </p>
                        </div>
                    </div>
                </div>
            </GlassModal>
        </>
    );
}
