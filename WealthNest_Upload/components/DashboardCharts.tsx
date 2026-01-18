"use client"

import dynamic from 'next/dynamic'
import { GlassCard } from '@/components/ui/GlassCard'

const PortfolioPie = dynamic(() => import('@/components/charts/PortfolioPie').then(mod => mod.PortfolioPie), { ssr: false })
const PerformanceBar = dynamic(() => import('@/components/charts/PerformanceBar').then(mod => mod.PerformanceBar), { ssr: false })

interface DashboardChartsProps {
    pieData: any[];
    barData: any[];
}

export function DashboardCharts({ pieData, barData }: DashboardChartsProps) {
    return (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6" suppressHydrationWarning>
            <GlassCard className="h-80" suppressHydrationWarning>
                <div className="flex flex-col h-full p-6" suppressHydrationWarning>
                    <h3 className="text-neutral-400 text-sm font-medium mb-4 uppercase tracking-wider">Allocation</h3>
                    <div className="flex-1 min-h-0" suppressHydrationWarning>
                        <PortfolioPie data={pieData} />
                    </div>
                </div>
            </GlassCard>
            <GlassCard className="h-80" suppressHydrationWarning>
                <div className="flex flex-col h-full p-6" suppressHydrationWarning>
                    <h3 className="text-neutral-400 text-sm font-medium mb-4 uppercase tracking-wider">Top Performers</h3>
                    <div className="flex-1 min-h-0" suppressHydrationWarning>
                        <PerformanceBar data={barData} />
                    </div>
                </div>
            </GlassCard>
        </div>
    )
}
