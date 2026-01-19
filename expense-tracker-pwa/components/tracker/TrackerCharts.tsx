
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
            {/* Cash Flow Analysis */}
            <GlassCard className="p-6 flex flex-col items-center justify-center min-h-[350px]" suppressHydrationWarning>
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-6 self-start">Cash Flow Analysis</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={barData}>
                        <XAxis dataKey="name" stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val: any) => `₹${val / 1000}k`} />
                        <Tooltip
                            contentStyle={{ backgroundColor: "#171717", border: "1px solid #262626", borderRadius: "8px" }}
                            itemStyle={{ color: "#fff" }}
                            formatter={(val: any) => [`₹${val}`, 'Amount']}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </GlassCard>

            {/* Expense Breakdown */}
            <GlassCard className="p-6 flex flex-col items-center justify-center min-h-[350px]" suppressHydrationWarning>
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-6 self-start">Expense Breakdown</h3>
                <ResponsiveContainer width="100%" height={250}>
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
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: "#171717", border: "1px solid #262626", borderRadius: "8px" }}
                            itemStyle={{ color: "#fff" }}
                            formatter={(val: any) => [`₹${val}`, 'Amount']}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </GlassCard>
        </div>
    );
}
