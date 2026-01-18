'use client'

import { GlassCard } from '@/components/ui/GlassCard'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#10b981', '#06b6d4'];

export function CategoryPieChart({ expenses }: { expenses: any[] }) {
    // Process data
    const categoryTotals = expenses.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount
        return acc
    }, {} as Record<string, number>)

    const chartData = Object.entries(categoryTotals)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => (b.value as number) - (a.value as number))
        .slice(0, 6) // Top 6

    if (chartData.length === 0) {
        return (
            <GlassCard className="p-6 h-[400px] flex items-center justify-center">
                <p className="text-neutral-500">No expense data available.</p>
            </GlassCard>
        )
    }

    return (
        <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-white mb-6">Top Spending Categories</h3>
            <div className="h-[300px] w-full" suppressHydrationWarning>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.5)" />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#171717', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value: any) => `₹${value.toLocaleString()}`}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                            wrapperStyle={{ fontSize: '12px', color: '#a3a3a3' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </GlassCard>
    )
}
