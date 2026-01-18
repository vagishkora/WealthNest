
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { OverviewCard } from '@/components/OverviewCard'
import { getLiveNAVs } from '@/lib/nav'
import { getStockQuotes } from '@/lib/stocks'
import Link from 'next/link'
import { Suspense } from 'react'
import { Plus, Gift } from 'lucide-react'
import { DashboardCharts } from '@/components/DashboardCharts'
import { GlassCard, GradientText } from '@/components/ui/GlassCard'
import { RefreshButton } from '@/components/RefreshButton'
import { InsightsCard } from '@/components/dashboard/InsightsCard'
import { GamificationCard } from '@/components/gamification/GamificationCard'

export default async function DashboardPage() {
    const session = await auth()
    if (!session?.user?.id) return null

    const investments = await prisma.investment.findMany({
        where: { userId: session.user.id },
        include: { fundReference: true }
    })

    // Get live NAVs and Stock Quotes
    const amfiCodes = investments.map(i => i.amfiCode || i.fundReference?.amfiCode).filter(c => c) as string[]
    const tickers = investments.map(i => i.tickerSymbol).filter(t => t) as string[]

    const [navs, stockQuotes] = await Promise.all([
        getLiveNAVs(amfiCodes),
        getStockQuotes(tickers)
    ])

    // Calculate Totals and Chart Data
    let totalInvested = 0
    let totalCurrent = 0
    let totalDayPnL = 0
    let mfTotal = 0
    let stockTotal = 0
    let otherTotal = 0

    const barData = investments
        .map(inv => {
            const code = inv.amfiCode || inv.fundReference?.amfiCode
            const navData = code ? navs[code] : null
            const stockQuote = inv.tickerSymbol ? stockQuotes[inv.tickerSymbol] : null

            let val = inv.amount // fallback
            // Use precise invested amount
            const investedVal = inv.currentInvestedAmount || inv.amount

            if (inv.currentUnits && navData) {
                val = inv.currentUnits * navData.nav
            } else if (inv.tickerSymbol && stockQuote && inv.quantity) {
                val = inv.quantity * stockQuote.price
            } else {
                val = investedVal
            }

            return {
                name: inv.fundReference?.name || inv.name || 'Unknown',
                invested: investedVal,
                current: val,
                navData: navData || stockQuote // flexible
            }
        })
        .sort((a, b) => b.current - a.current)
        .slice(0, 5) // Top 5

    investments.forEach(inv => {
        const investedVal = inv.currentInvestedAmount || inv.amount
        totalInvested += investedVal

        const code = inv.amfiCode || inv.fundReference?.amfiCode
        const navData = code ? navs[code] : null
        const stockQuote = inv.tickerSymbol ? stockQuotes[inv.tickerSymbol] : null

        let currentVal = investedVal

        if (inv.currentUnits && navData) {
            currentVal = inv.currentUnits * navData.nav
            const prevVal = inv.currentUnits * navData.previousNav
            totalDayPnL += (currentVal - prevVal)
        } else if (inv.tickerSymbol && stockQuote && inv.quantity) {
            currentVal = inv.quantity * stockQuote.price
            const prevVal = inv.quantity * stockQuote.previousClose
            totalDayPnL += (currentVal - prevVal)
        }

        totalCurrent += currentVal

        // Asset Allocation
        if (inv.type === 'SIP' || inv.type === 'LUMPSUM' || inv.fundReference?.category === 'Mutual Fund') {
            mfTotal += currentVal
        } else if (inv.type === 'STOCK') {
            stockTotal += currentVal
        } else {
            otherTotal += currentVal
        }
    })

    const pieData = [
        { name: 'Mutual Funds', value: mfTotal },
        { name: 'Stocks', value: stockTotal },
        { name: 'Other', value: otherTotal }
    ]

    const totalPnL = totalCurrent - totalInvested
    const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0
    const prevTotal = totalCurrent - totalDayPnL
    const daysPnLPercent = prevTotal > 0 ? (totalDayPnL / prevTotal) * 100 : 0

    // --- Gamification Stats ---

    // 1. Transaction Count (All Time)
    const [txCount, incomeCount] = await Promise.all([
        prisma.expense.count({ where: { userId: session.user.id } }),
        prisma.income.count({ where: { userId: session.user.id } })
    ])
    const transactionCount = txCount + incomeCount

    // 2. Savings Rate (This Month)
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const monthlyExpenses = await prisma.expense.aggregate({
        where: { userId: session.user.id, date: { gte: startOfMonth } },
        _sum: { amount: true }
    })
    const monthlyIncome = await prisma.income.aggregate({
        where: { userId: session.user.id, date: { gte: startOfMonth } },
        _sum: { amount: true }
    })
    const mExp = monthlyExpenses._sum.amount || 0
    const mInc = monthlyIncome._sum.amount || 0
    const savingsRate = mInc > 0 ? ((mInc - mExp) / mInc) * 100 : 0

    // 3. Steak Logic Removed (User feedback: incentives bad spending habits)

    return (
        <div className="p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black min-h-screen pb-20 text-white" suppressHydrationWarning>
            <header className="flex justify-between items-center mb-8" suppressHydrationWarning>
                <div suppressHydrationWarning>
                    <h1 className="text-3xl font-bold">
                        <GradientText>Dashboard</GradientText>
                    </h1>
                    <p className="text-neutral-500 text-sm mt-1">Welcome back, {session.user?.name || 'Investor'}</p>
                </div>
                <div className="flex items-center gap-2" suppressHydrationWarning>
                    <RefreshButton />

                    {/* WealthWrapped - Only visible Dec 25-31 (or in Dev mode) */}
                    {((new Date().getMonth() === 11 && new Date().getDate() >= 25) || process.env.NODE_ENV === 'development') && (
                        <Link href="/wrapped" className="group relative p-2 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 hover:scale-105 transition-all shadow-lg shadow-purple-500/20" title="Your 2026 Wrapped">
                            <Gift className="text-white animate-bounce-subtle" size={20} />
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                            </span>
                        </Link>
                    )}

                    <Link href="/investments/new" className="bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md p-3 rounded-full transition-all">
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

            <div className="mt-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gamification Card */}
                <GamificationCard
                    savingsRate={savingsRate}
                    totalInvested={totalInvested}
                    transactionCount={transactionCount}
                    netWorth={totalCurrent} // Using Portfolio Value as proxy for "Wealth" in this context
                />
                <InsightsCard />
            </div>

            <div className="mt-8" suppressHydrationWarning>
                <DashboardCharts pieData={pieData} barData={barData} />
            </div>

        </div>
    )
}
