import { formatCurrency } from "@/lib/utils"
import { GlassCard, GradientText } from "./ui/GlassCard"

export function OverviewCard({
    invested,
    current,
    daysPnL,
    daysPnLPercent,
    totalPnL,
    totalPnLPercent
}: {
    invested: number,
    current: number,
    daysPnL: number,
    daysPnLPercent: number,
    totalPnL: number,
    totalPnLPercent: number
}) {
    const isPositive = totalPnL >= 0
    const isDayPositive = daysPnL >= 0

    return (
        <GlassCard gradient className="p-8" suppressHydrationWarning>
            <div className="flex justify-between items-center mb-8" suppressHydrationWarning>
                <GradientText className="text-sm font-bold tracking-widest uppercase">Portfolio Snapshot</GradientText>
                {/* Could add refresh button here */}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8" suppressHydrationWarning>
                <div suppressHydrationWarning>
                    <p className="text-neutral-400 text-xs mb-1 uppercase tracking-wider">Invested</p>
                    <p className="text-2xl md:text-3xl font-bold text-white tracking-tight">{formatCurrency(invested)}</p>
                </div>

                <div suppressHydrationWarning>
                    <p className="text-neutral-400 text-xs mb-1 uppercase tracking-wider">Current</p>
                    <p className="text-2xl md:text-3xl font-bold text-white tracking-tight">{formatCurrency(current)}</p>
                </div>

                <div suppressHydrationWarning>
                    <p className="text-neutral-400 text-xs mb-1 uppercase tracking-wider">Day's P&L</p>
                    <div className={`flex items-baseline gap-2 ${isDayPositive ? 'text-emerald-400' : 'text-rose-500'}`} suppressHydrationWarning>
                        <span className="text-xl font-bold">
                            {isDayPositive ? '+' : ''}{formatCurrency(daysPnL)}
                        </span>
                        <span className="text-xs font-mono opacity-80">
                            ({isDayPositive ? '+' : ''}{daysPnLPercent.toFixed(2)}%)
                        </span>
                    </div>
                </div>

                <div suppressHydrationWarning>
                    <p className="text-neutral-400 text-xs mb-1 uppercase tracking-wider">Total P&L</p>
                    <div className={`flex items-baseline gap-2 ${isPositive ? 'text-emerald-400' : 'text-rose-500'}`} suppressHydrationWarning>
                        <span className="text-xl font-bold">
                            {isPositive ? '+' : ''}{formatCurrency(totalPnL)}
                        </span>
                        <span className="text-xs font-mono opacity-80">
                            ({isPositive ? '+' : ''}{totalPnLPercent.toFixed(2)}%)
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex justify-between text-xs text-neutral-400" suppressHydrationWarning>
                <div className="flex gap-6" suppressHydrationWarning>
                    {/* Buttons removed as per request */}
                </div>
                <div suppressHydrationWarning>
                    XIRR: <span className="text-emerald-400 cursor-pointer hover:underline">14.2% (Est)</span>
                </div>
            </div>
        </GlassCard>
    )
}
