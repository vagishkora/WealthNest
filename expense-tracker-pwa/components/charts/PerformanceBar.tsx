'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatCurrency } from '@/lib/utils'

export function PerformanceBar({ data }: { data: { name: string, invested: number, current: number }[] }) {
    if (data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-neutral-500 text-sm">
                No data to display
            </div>
        )
    }

    return (
        <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        width={100}
                        tick={{ fill: '#a3a3a3', fontSize: 10 }}
                        interval={0}
                    />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px' }}
                        formatter={(value: number | undefined) => formatCurrency(value || 0)}
                    />
                    <Legend iconType="circle" />
                    <Bar dataKey="invested" name="Invested" fill="#525252" radius={[0, 4, 4, 0]} barSize={10} />
                    <Bar dataKey="current" name="Current Value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={10} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
