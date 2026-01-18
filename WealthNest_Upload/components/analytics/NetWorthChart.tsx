'use client'

import { GlassCard } from '@/components/ui/GlassCard'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export function NetWorthChart({ data }: { data: any[] }) {
    // Format data for chart
    const chartData = data.map(d => ({
        date: new Date(d.date).toLocaleDateString('default', { month: 'short', year: '2-digit' }),
        value: d.totalAssets - d.totalLiabilities
    }))

    if (chartData.length === 0) {
        return (
            <GlassCard className="p-6 h-[400px] flex items-center justify-center">
                <p className="text-neutral-500">No Net Worth history available yet.</p>
            </GlassCard>
        )
    }

    return (
        <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-white mb-6">Net Worth Trend</h3>
            <div className="h-[300px] w-full" suppressHydrationWarning>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="date"
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
                            itemStyle={{ color: '#fff' }}
                            formatter={(value: any) => [`₹${value.toLocaleString()}`, "Net Worth"]}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#10b981"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </GlassCard>
    )
}
