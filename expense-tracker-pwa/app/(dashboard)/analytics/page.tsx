import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { GradientText } from '@/components/ui/GlassCard'
// import { NetWorthChart } from '@/components/analytics/NetWorthChart'
import { CategoryPieChart } from '@/components/analytics/CategoryPieChart'
import { MonthlyTrendChart } from '@/components/analytics/MonthlyTrendChart'

export default async function AnalyticsPage() {
    const session = await auth()
    if (!session?.user?.id) return null

    // Fetch data for analytics
    // Note: Net Worth history usually requires a specific 'snapshot' table which we have.
    // For now, we will fetch snapshots, expenses, and incomes.

    const snapshots = await prisma.snapshot.findMany({
        where: { userId: session.user.id },
        orderBy: { date: 'asc' },
        take: 12 // Last 12 months
    })

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const expenses = await prisma.expense.findMany({
        where: {
            userId: session.user.id,
            date: { gte: sixMonthsAgo }
        },
        orderBy: { date: 'desc' }
    })

    const incomes = await prisma.income.findMany({
        where: {
            userId: session.user.id,
            date: { gte: sixMonthsAgo }
        },
        orderBy: { date: 'desc' }
    })

    return (
        <div className="p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black min-h-screen pb-32 text-white" suppressHydrationWarning>
            <header className="mb-8" suppressHydrationWarning>
                <h1 className="text-3xl font-bold">
                    <GradientText>Analytics</GradientText>
                </h1>
                <p className="text-neutral-500 text-sm mt-1">Deep dive into your financial health</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" suppressHydrationWarning>
                {/* Net Worth Trend - Removed by User Request */}
                {/* <div className="lg:col-span-2" suppressHydrationWarning>
                    <NetWorthChart data={snapshots} />
                </div> */}

                {/* Monthly Income vs Expense - Removed by User Request */}
                {/* <MonthlyTrendChart expenses={expenses} incomes={incomes} /> */}

                {/* Expense Categories - Removed by User Request */}
                {/* <CategoryPieChart expenses={expenses} /> */}
            </div>
        </div>
    )
}
