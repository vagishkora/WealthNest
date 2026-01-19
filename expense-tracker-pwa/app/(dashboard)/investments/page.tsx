import { Suspense } from 'react'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getLiveNAVs } from '@/lib/nav'
import { getStockQuotes } from '@/lib/stocks'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { OverviewCard } from '@/components/OverviewCard'
import { BentoGrid } from '@/components/investments/BentoGrid'
import { BentoCard } from '@/components/investments/BentoCard'
import { PortfolioFilters } from '@/components/investments/PortfolioFilters'
import { BentoGridSkeleton } from '@/components/investments/BentoGridSkeleton'

export default async function InvestmentsPage(props: {
    searchParams: Promise<{
        type?: string;
        q?: string;
    }>
}) {
    const params = await props.searchParams;
    const session = await auth()
    if (!session?.user?.id) return null

    return (
        <div className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black min-h-screen text-white pb-20">
            <header className="px-4 py-8 max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex flex-col">
                    <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-500">
                        Portfolio
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/investments/new" className="group relative px-6 py-3 rounded-full bg-white text-black font-bold text-sm overflow-hidden transition-all hover:scale-105 active:scale-95">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="relative z-10 flex items-center gap-2">
                            <Plus size={16} />
                            Add Asset
                        </span>
                    </Link>
                </div>
            </header>

            {/* Layout Shell - The Content Loads with Suspense */}

            {/* We render everything inside one Async Component for simplicity of data sharing 
                Otherwise we'd need to fetch Portfolio Totals separately from Grid Data.
                To keep it highly cohesive, we load the whole dashboard view together. */}
            <Suspense fallback={<BentoGridSkeleton />}>
                <AsyncInvestmentGrid userId={session.user.id} searchParams={params} />
            </Suspense>
        </div>
    )
}

async function AsyncInvestmentGrid({ userId, searchParams }: { userId: string, searchParams: any }) {
    const investments = await prisma.investment.findMany({
        where: { userId: userId },
        include: { fundReference: true },
        orderBy: { startDate: 'desc' }
    })

    // Fetch live NAVs and Stock Quotes
    const amfiCodes = investments.map(inv => inv.amfiCode || inv.fundReference?.amfiCode).filter(Boolean) as string[]
    const tickers = investments.map(inv => inv.tickerSymbol).filter(Boolean) as string[]

    const [navs, stockQuotes] = await Promise.all([
        getLiveNAVs(amfiCodes),
        getStockQuotes(tickers)
    ])

    let totalInvested = 0
    let totalCurrent = 0
    let totalDayPnL = 0

    // Enrich Data
    const enrichedInvestments = investments.map(inv => {
        const code = inv.amfiCode || inv.fundReference?.amfiCode
        const navData = code ? navs[code] : undefined
        const ticker = inv.tickerSymbol
        const stockQuote = ticker ? stockQuotes[ticker] : undefined

        const isStock = inv.type === 'STOCK' || !!ticker

        const investedAmount = inv.currentInvestedAmount || inv.amount

        let currentValue = investedAmount
        let currentPrice = 0
        let avgPrice = 0
        let changePercent = 0

        if (isStock) {
            avgPrice = inv.averageBuyPrice || (inv.quantity ? investedAmount / inv.quantity : 0)

            if (inv.quantity && stockQuote) {
                currentPrice = stockQuote.price
                currentValue = inv.quantity * stockQuote.price
                changePercent = stockQuote.changePercent
            } else {
                currentValue = investedAmount
            }
        } else {
            if (inv.currentUnits) {
                avgPrice = investedAmount / inv.currentUnits
                if (navData) {
                    currentPrice = navData.nav
                    currentValue = inv.currentUnits * navData.nav
                    if (navData.previousNav) {
                        changePercent = ((navData.nav - navData.previousNav) / navData.previousNav) * 100
                    }
                } else {
                    currentValue = investedAmount
                }
            } else {
                currentValue = investedAmount
            }
        }

        const pnl = currentValue - investedAmount
        const pnlPercent = investedAmount > 0 ? (pnl / investedAmount) * 100 : 0

        let dayPnL = 0
        if (isStock && stockQuote && inv.quantity) {
            const prevVal = inv.quantity * stockQuote.previousClose
            dayPnL = currentValue - prevVal
        } else if (!isStock && inv.currentUnits && navData) {
            const prevVal = inv.currentUnits * navData.previousNav
            dayPnL = currentValue - prevVal
        }

        totalInvested += investedAmount
        totalCurrent += currentValue
        totalDayPnL += dayPnL

        return { ...inv, currentValue, currentPrice, avgPrice, pnl, pnlPercent, changePercent, isStock, ticker, dayPnL, investedAmount }
    })

    // Grouping Logic
    const groups: Record<string, any> = {}

    enrichedInvestments.forEach(inv => {
        const key = inv.amfiCode || inv.fundReference?.amfiCode || inv.ticker || inv.name || 'Unknown'
        if (!groups[key]) {
            groups[key] = {
                title: inv.fundReference?.name || inv.name || 'Unknown Investment',
                type: inv.type,
                isStock: inv.isStock,
                ticker: inv.ticker,
                totalValue: 0,
                totalInvested: 0,
                dayPnL: 0,
                investments: []
            }
        }
        const group = groups[key]
        group.totalValue += inv.currentValue
        group.totalInvested += inv.investedAmount
        group.dayPnL += inv.dayPnL
        group.investments.push(inv)
    })

    // Flatten groups 
    let allGroups = Object.values(groups).map(g => {
        const totalPnL = g.totalValue - g.totalInvested
        const totalPnLPercent = g.totalInvested > 0 ? (totalPnL / g.totalInvested) * 100 : 0

        return {
            ...g,
            totalPnL,
            totalPnLPercent,
            investmentId: g.investments[0]?.id
        }
    })

    // 🔍 FILTERING LOGIC
    if (searchParams?.type && searchParams.type !== 'ALL') {
        allGroups = allGroups.filter(g =>
            searchParams.type === 'STOCK' ? g.isStock : !g.isStock
        );
    }

    if (searchParams?.q) {
        const query = searchParams.q.toLowerCase();
        allGroups = allGroups.filter(g =>
            g.title.toLowerCase().includes(query) ||
            g.ticker?.toLowerCase().includes(query)
        );
    }

    // Sort to find Hero (Largest Value) and Featured (High Returns)
    const sortedByValue = [...allGroups].sort((a, b) => b.totalValue - a.totalValue);
    const heroId = sortedByValue[0]?.investmentId;

    const sortedByReturns = [...allGroups].sort((a, b) => b.totalPnLPercent - a.totalPnLPercent);
    const topGainerId = sortedByReturns[0]?.investmentId;

    const totalPnL = totalCurrent - totalInvested
    const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0
    const prevTotal = totalCurrent - totalDayPnL
    const daysPnLPercent = prevTotal > 0 ? (totalDayPnL / prevTotal) * 100 : 0

    return (
        <>
            <div className="px-4 max-w-7xl mx-auto mb-8">
                <OverviewCard
                    invested={totalInvested}
                    current={totalCurrent}
                    daysPnL={totalDayPnL}
                    daysPnLPercent={daysPnLPercent}
                    totalPnL={totalPnL}
                    totalPnLPercent={totalPnLPercent}
                />
            </div>

            {/* Filters */}
            <div className="px-4 max-w-7xl mx-auto">
                <PortfolioFilters />
            </div>

            {allGroups.length > 0 ? (
                <BentoGrid>
                    {allGroups.map((group, idx) => {
                        let variant: "hero" | "featured" | "standard" = "standard";
                        if (group.investmentId === heroId) variant = "hero";
                        else if (group.investmentId === topGainerId && group.totalPnLPercent > 0) variant = "featured";

                        return (
                            <BentoCard
                                key={idx}
                                id={group.investmentId}
                                title={group.title}
                                type={group.type}
                                isStock={group.isStock}
                                ticker={group.ticker}
                                totalValue={group.totalValue}
                                totalInvested={group.totalInvested}
                                dayPnL={group.dayPnL}
                                totalPnL={group.totalPnL}
                                totalPnLPercent={group.totalPnLPercent}
                                variant={variant}
                                lots={group.investments.map((inv: any) => ({
                                    ...inv,
                                    startDate: inv.startDate ? inv.startDate.toISOString() : null,
                                    fundReference: null // Remove deep cyclic/unused data if any
                                }))}
                            />
                        )
                    })}
                </BentoGrid>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center opacity-60">
                    <div className="w-20 h-20 bg-neutral-900 rounded-3xl flex items-center justify-center mb-6 border border-white/5">
                        <Plus size={32} className="text-neutral-600" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-300">System Offline</h3>
                    <p className="text-neutral-500 max-w-xs mt-2">Initialize your portfolio by adding your first asset to the grid.</p>
                </div>
            )}
        </>
    )
}
