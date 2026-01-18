
"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

interface TrackerChartsProps {
    income: number;
    expense: number;
    categoryBreakdown: { name: string; value: number }[];
}

const COLORS = ['#10b981', '#f43f5e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

export function TrackerCharts({ income, expense, categoryBreakdown }: TrackerChartsProps) {
    const barData = [
        { name: 'Income', value: income, fill: '#10b981' },
        { name: 'Expenses', value: expense, fill: '#f43f5e' },
    ];

    // Filter clear small categories for cleaner chart
    const pieData = categoryBreakdown.length > 0 ? categoryBreakdown : [{ name: 'No Data', value: 1 }];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8" suppressHydrationWarning>
            {/* Income vs Expense Bar Chart */}
            <GlassCard className="h-80 flex flex-col p-6" suppressHydrationWarning>
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-6">Cash Flow Analysis</h3>
                <div className="flex-1 min-h-0" suppressHydrationWarning>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" tick={{ fill: '#d4d4d4', fontSize: 12 }} width={80} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                                formatter={(value: any) => [formatCurrency(Number(value || 0)), '']}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
                                {barData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>

            {/* Category Pie Chart */}
            <GlassCard className="h-80 flex flex-col p-6" suppressHydrationWarning>
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-6">Expense Breakdown</h3>
                <div className="flex-1 min-h-0 relative" suppressHydrationWarning>
                    {categoryBreakdown.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-neutral-500 text-xs">
                            No expenses yet
                        </div>
                    )}
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={categoryBreakdown.length > 0 ? COLORS[index % COLORS.length] : '#333'} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                                formatter={(value: any) => [formatCurrency(Number(value || 0)), '']}
                            />
                            <Legend
                                verticalAlign="middle"
                                align="right"
                                layout="vertical"
                                iconSize={8}
                                wrapperStyle={{ fontSize: '10px', color: '#a3a3a3' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>
        </div>
    );
}
