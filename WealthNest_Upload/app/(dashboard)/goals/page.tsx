
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { GlassCard, GradientText } from '@/components/ui/GlassCard'
import { GoalCard } from '@/components/GoalCard'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getLiveNAVs } from '@/lib/nav'
import { getStockQuotes } from '@/lib/stocks'

export default async function GoalsPage() {
    const session = await auth()
    if (!session?.user?.id) return null

    const goals = await prisma.goal.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            investments: {
                include: { fundReference: true }
            }
        }
    })

    // Get live prices for all linked investments
    const allInvestments = goals.flatMap(g => g.investments)
    const amfiCodes = allInvestments.map(i => i.amfiCode || i.fundReference?.amfiCode).filter(c => c) as string[]
    const tickers = allInvestments.map(i => i.tickerSymbol).filter(t => t) as string[]

    // Fetch live data
    const [navs, stockQuotes] = await Promise.all([
        getLiveNAVs(amfiCodes),
        getStockQuotes(tickers)
    ])

    // Calculate dynamic progress
    const goalsWithProgress = goals.map(goal => {
        const automatedTotal = goal.investments.reduce((sum, inv) => {
            let val = inv.currentInvestedAmount || inv.amount // fallback

            const code = inv.amfiCode || inv.fundReference?.amfiCode
            const navData = code ? navs[code] : null
            const stockQuote = inv.tickerSymbol ? stockQuotes[inv.tickerSymbol] : null

            if (inv.currentUnits && navData) {
                val = inv.currentUnits * navData.nav
            } else if (inv.tickerSymbol && stockQuote && inv.quantity) {
                val = inv.quantity * stockQuote.price
            }
            return sum + val
        }, 0)

        return {
            ...goal,
            // Total = Manual Amount (Cash/Other) + Automated Investments
            currentAmount: goal.currentAmount + automatedTotal,
            automatedAmount: automatedTotal
        }
    })

    const totalTarget = goalsWithProgress.reduce((acc, g) => acc + g.targetAmount, 0)
    const totalSaved = goalsWithProgress.reduce((acc, g) => acc + g.currentAmount, 0)
    const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0

    return (
        <div className="p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black min-h-screen pb-32 text-white">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">
                        <GradientText>Financial Goals</GradientText>
                    </h1>
                    <p className="text-neutral-500 text-sm mt-1">Track your dreams.</p>
                </div>
                <Link href="/goals/new" className="bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md p-3 rounded-full transition-all">
                    <Plus className="text-white" size={24} />
                </Link>
            </header>

            {goals.length > 0 && (
                <GlassCard className="mb-8 p-6 flex items-center justify-between bg-gradient-to-br from-emerald-900/20 to-neutral-900/50">
                    <div>
                        <h2 className="text-lg font-semibold text-white">Total Progress</h2>
                        <p className="text-neutral-400 text-sm">Across all {goals.length} goals</p>
                    </div>
                    <div className="text-right">
                        <span className="text-3xl font-bold text-emerald-400">{overallProgress.toFixed(0)}%</span>
                    </div>
                </GlassCard>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goalsWithProgress.map(goal => (
                    <GoalCard key={goal.id} goal={goal} />
                ))}
            </div>

            {goals.length === 0 && (
                <div className="text-center py-20 opacity-50">
                    <p>No goals set yet. Start by clicking +</p>
                </div>
            )}
        </div>
    )
}
