import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getStockQuotes } from '@/lib/stocks'
import { OverviewCard } from '@/components/OverviewCard'
import { GlassCard, GradientText } from '@/components/ui/GlassCard'
import { formatCurrency, cn } from '@/lib/utils'
import { TrendingUp, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react'
import Link from 'next/link'
import { RefreshButton } from '@/components/RefreshButton'

export default async function StocksPage() {
    const session = await auth()
    if (!session?.user?.id) return null

    // 1. Fetch Stocks
    const stocks = await prisma.investment.findMany({
        where: {
            userId: session.user.id,
            type: 'STOCK'
        },
        orderBy: { name: 'asc' }
    })

    // 2. Fetch Live Prices
    const tickers = stocks.map(s => s.tickerSymbol).filter(t => t) as string[]
    const quotes = await getStockQuotes(tickers)

    // 3. Calculate Metrics
    let totalInvested = 0
    let totalCurrent = 0
    let totalDayPnL = 0

    const enrichedStocks = stocks.map(stock => {
        const quote = stock.tickerSymbol ? quotes[stock.tickerSymbol] : null
        const currentPrice = quote?.price || 0
        const prevClose = quote?.previousClose || 0
        const quantity = stock.quantity || 0

        // Value
        const invested = stock.amount
        const current = quantity * currentPrice || invested // fallback

        // PnL
        const pnl = current - invested
        const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0

        // Day PnL
        const dayPnL = (currentPrice - prevClose) * quantity

        // Totals
        totalInvested += invested
        totalCurrent += current
        totalDayPnL += dayPnL

        return {
            ...stock,
            currentPrice,
            current,
            pnl,
            pnlPercent,
            dayPnL,
            dayChangePercent: quote?.changePercent || 0
        }
    })

    const totalPnL = totalCurrent - totalInvested
    const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0
    const prevTotal = totalCurrent - totalDayPnL
    const daysPnLPercent = prevTotal > 0 ? (totalDayPnL / prevTotal) * 100 : 0

    return (
        <div className="p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black min-h-screen pb-32 text-white">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">
                        <GradientText>Stock Portfolio</GradientText>
                    </h1>
                    <p className="text-neutral-500 text-sm mt-1">Equity Holdings</p>
                </div>
                <div className="flex items-center gap-2">
                    <RefreshButton />
                    <Link href="/investments/new?type=STOCK" className="bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md p-3 rounded-full transition-all">
                        <Plus className="text-white" size={24} />
                    </Link>
                </div>
            </header>

            <OverviewCard
                invested={totalInvested}
                current={totalCurrent}
                daysPnL={totalDayPnL}
                daysPnLPercent={daysPnLPercent}
                totalPnL={totalPnL}
                totalPnLPercent={totalPnLPercent}
            />

            <div className="mt-8 space-y-4">
                {enrichedStocks.map(stock => (
                    <GlassCard key={stock.id} className="p-5">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                    <TrendingUp size={24} className="text-emerald-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-white mb-1">{stock.name}</h3>
                                    <p className="text-xs text-neutral-400 font-mono">{stock.tickerSymbol}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-mono font-bold text-lg text-white">{formatCurrency(stock.current)}</p>
                                <p className={cn("text-xs flex items-center justify-end gap-1 font-mono font-medium", stock.pnl >= 0 ? "text-emerald-400" : "text-rose-500")}>
                                    {stock.pnl >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                    {formatCurrency(Math.abs(stock.pnl))} ({Math.abs(stock.pnlPercent).toFixed(2)}%)
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 py-3 border-t border-white/5 bg-white/5 rounded-lg px-4">
                            <div>
                                <p className="text-neutral-500 text-[10px] uppercase mb-1 tracking-wider font-semibold">Qty</p>
                                <p className="text-white font-mono text-sm">{stock.quantity}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-neutral-500 text-[10px] uppercase mb-1 tracking-wider font-semibold">Avg Price</p>
                                <p className="text-white font-mono text-sm">{formatCurrency(stock.averageBuyPrice || 0)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-neutral-500 text-[10px] uppercase mb-1 tracking-wider font-semibold">LTP</p>
                                <p className="text-white font-mono text-sm">{formatCurrency(stock.currentPrice)}</p>
                            </div>
                        </div>
                    </GlassCard>
                ))}

                {enrichedStocks.length === 0 && (
                    <div className="text-center py-20 text-neutral-500">
                        No stocks found. Add one to see it here!
                    </div>
                )}
            </div>
        </div>
    )
}
