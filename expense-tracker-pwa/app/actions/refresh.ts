'use server'

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { syncInvestmentUnits } from "@/lib/sync"

export async function refreshData() {
    // 1. Sync all investments (MFs + SIPs) to ensure units/invested amount is correct
    // We fetch IDs first
    const investments = await prisma.investment.findMany({
        where: {
            OR: [
                { type: 'SIP' },
                { amfiCode: { not: null } }
            ]
        },
        select: { id: true }
    })

    // Run parallel sync
    await Promise.allSettled(investments.map(inv => syncInvestmentUnits(inv.id)))

    // 2. Invalidate MF API cache
    // 2. Invalidate MF API cache
    // revalidateTag('nav')

    // 3. Revalidate Paths
    revalidatePath('/dashboard')
    revalidatePath('/stocks')
    revalidatePath('/investments')
    revalidatePath('/goals')

    return { success: true, timestamp: Date.now() }
}
