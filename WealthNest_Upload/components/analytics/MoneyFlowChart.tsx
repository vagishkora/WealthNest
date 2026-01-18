"use client"

import { Card, CardHeader, CardTitle } from "@/components/ui/GlassCard"
import { ResponsiveContainer, Sankey, Tooltip } from 'recharts'
import { formatCurrency } from "@/lib/utils"

interface MoneyFlowChartProps {
    data: {
        nodes: { name: string }[]
        links: { source: number; target: number; value: number }[]
    }
}

export function MoneyFlowChart({ data }: MoneyFlowChartProps) {
    if (!data || data.nodes.length === 0 || data.links.length === 0) {
        return (
            <Card className="p-6 flex items-center justify-center min-h-[400px]">
                <p className="text-neutral-500">Not enough data for Money Flow yet.</p>
            </Card>
        )
    }

    return (
        <Card className="p-6 h-full min-h-[400px] flex flex-col">
            <CardHeader className="px-0 pt-0 mb-4">
                <CardTitle>Money Flow (Income → Expenses)</CardTitle>
            </CardHeader>
            <div className="flex-1 w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <Sankey
                        data={data}
                        node={{
                            stroke: 'none',
                            fill: '#10b981', // Emerald-500
                            width: 10,
                        }}
                        link={{
                            stroke: '#3f3f46', // Neutral-700
                            fill: 'none',
                            strokeOpacity: 0.2, // Subtle
                        }}
                        margin={{ top: 20, bottom: 20, left: 10, right: 10 }}
                    >
                        <Tooltip
                            content={({ payload }) => {
                                if (!payload || !payload.length) return null
                                const data = payload[0].payload
                                const isLink = data.source && data.target

                                return (
                                    <div className="bg-neutral-900 border border-white/10 p-3 rounded-lg shadow-xl">
                                        {isLink ? (
                                            <p className="text-sm">
                                                <span className="text-emerald-400 font-bold">{data.source.name}</span>
                                                <span className="text-neutral-500 mx-2">→</span>
                                                <span className="text-rose-400 font-bold">{data.target.name}</span>
                                                <br />
                                                <span className="text-white font-mono mt-1 block">{formatCurrency(data.value)}</span>
                                            </p>
                                        ) : (
                                            <p className="text-sm font-bold text-white">
                                                {data.name}: {formatCurrency(data.value)}
                                            </p>
                                        )}
                                    </div>
                                )
                            }}
                        />
                    </Sankey>
                </ResponsiveContainer>
            </div>
            <p className="text-xs text-neutral-500 mt-4 text-center">
                Flow shows Top 5 Income Sources → Top 8 Spending Categories
            </p>
        </Card>
    )
}
