'use client'

import { GlassCard } from '@/components/ui/GlassCard'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts'

export function MonthlyTrendChart({ expenses, incomes }: { expenses: any[], incomes: any[] }) {
    // Process data by month
    const timeline: Record<string, { income: number, expense: number }> = {}

    const process = (items: any[], type: 'income' | 'expense') => {
        items.forEach(item => {
            const key = new Date(item.date).toLocaleDateString('default', { month: 'short' })
            if (!timeline[key]) timeline[key] = { income: 0, expense: 0 }
            timeline[key][type] += item.amount
        })
    }

    process(incomes, 'income')
    process(expenses, 'expense')

    const chartData = Object.entries(timeline).map(([name, val]) => ({
        name,
        Income: val.income,
        Expense: val.expense
    })).reverse() // Show oldest first usually, but check sort

    if (chartData.length === 0) {
        return (
            <GlassCard className="p-6 h-[400px] flex items-center justify-center">
                <p className="text-neutral-500">No transaction data available.</p>
            </GlassCard>
        )
    }

    return (
        <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-white mb-6">Income vs Expenses</h3>
            <div className="h-[300px] w-full" suppressHydrationWarning>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="name"
                            stroke="#525252"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#525252"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `₹${value / 1000}k`}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#171717', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </GlassCard>
    )
}
