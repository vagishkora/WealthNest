'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function addInvestment(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthorized" }

    const type = formData.get('type') as string
    const name = formData.get('name') as string
    const amount = parseFloat(formData.get('amount') as string)
    const startDate = new Date(formData.get('startDate') as string)

    // Optional or Derived
    const fundReferenceId = formData.get('fundReferenceId') as string || null
    const amfiCode = formData.get('amfiCode') as string || null
    const currentUnits = formData.get('currentUnits') ? parseFloat(formData.get('currentUnits') as string) : null
    const stepUpPercentage = formData.get('stepUpPercentage') ? parseFloat(formData.get('stepUpPercentage') as string) : null
    const goalId = formData.get('goalId') as string || null
    const interestRate = formData.get('interestRate') ? parseFloat(formData.get('interestRate') as string) : null
    const maturityDate = formData.get('maturityDate') ? new Date(formData.get('maturityDate') as string) : null

    // Stock specific
    const quantity = formData.get('quantity') ? parseFloat(formData.get('quantity') as string) : null
    const averageBuyPrice = formData.get('averageBuyPrice') ? parseFloat(formData.get('averageBuyPrice') as string) : null
    const tickerSymbol = formData.get('tickerSymbol') as string || null

    try {
        const inv = await prisma.investment.create({
            data: {
                userId: session.user.id,
                type, // SIP, LUMPSUM, STOCK, FD
                name,
                amount: (type === 'STOCK' && quantity && averageBuyPrice) ? (quantity * averageBuyPrice) : (amount || 0),
                startDate,
                fundReferenceId,
                quantity,
                averageBuyPrice,
                currentUnits,
                amfiCode,
                stepUpPercentage,
                interestRate,
                maturityDate,
                goalId,
                tickerSymbol // Critical for live stock tracking
            }
        })

        // Sync units automatically if it's a mutual fund
        if (type !== 'STOCK' && (amfiCode || fundReferenceId)) {
            // Only sync if units were NOT provided manually
            if (!currentUnits) {
                const { syncInvestmentUnits } = await import('@/lib/sync')
                await syncInvestmentUnits(inv.id)
            }
        }

        revalidatePath('/dashboard')
        revalidatePath('/investments')
        revalidatePath('/goals')
    } catch (error) {
        console.error("Create Investment Error:", error)
        return { error: "Failed to create investment" }
    }

    redirect('/dashboard')
}

export async function deleteInvestment(id: string) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthorized" }

    try {
        await prisma.investment.delete({
            where: { id, userId: session.user.id }
        })
        revalidatePath('/dashboard')
        revalidatePath('/investments')
        revalidatePath('/goals')
        return { success: true }
    } catch (error) {
        return { error: "Failed to delete" }
    }
}

export async function updateInvestment(id: string, formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthorized" }

    const type = formData.get('type') as string
    const name = formData.get('name') as string
    const amount = parseFloat(formData.get('amount') as string)
    const startDate = new Date(formData.get('startDate') as string)
    const fundReferenceId = formData.get('fundReferenceId') as string || null
    const amfiCode = formData.get('amfiCode') as string || null
    const currentUnits = formData.get('currentUnits') ? parseFloat(formData.get('currentUnits') as string) : null
    const stepUpPercentage = formData.get('stepUpPercentage') ? parseFloat(formData.get('stepUpPercentage') as string) : null
    const goalId = formData.get('goalId') as string || null
    const interestRate = formData.get('interestRate') ? parseFloat(formData.get('interestRate') as string) : null
    const maturityDate = formData.get('maturityDate') ? new Date(formData.get('maturityDate') as string) : null

    // Stock specific
    const quantity = formData.get('quantity') ? parseFloat(formData.get('quantity') as string) : null
    const averageBuyPrice = formData.get('averageBuyPrice') ? parseFloat(formData.get('averageBuyPrice') as string) : null
    const tickerSymbol = formData.get('tickerSymbol') as string || null

    try {
        const inv = await prisma.investment.update({
            where: { id, userId: session.user.id },
            data: {
                type,
                name,
                amount: (type === 'STOCK' && quantity && averageBuyPrice) ? (quantity * averageBuyPrice) : (amount || 0),
                startDate,
                fundReferenceId,
                quantity,
                averageBuyPrice,
                currentUnits,
                amfiCode,
                stepUpPercentage,
                interestRate,
                maturityDate,
                goalId,
                tickerSymbol // Critical update
            }
        })

        // Sync units automatically if it's a mutual fund
        if (type !== 'STOCK' && (amfiCode || fundReferenceId)) {
            // Only sync if units were NOT provided manually (or if user wants to force resync - complex logic, assume if provided we trust it)
            // But if updating and user CLEARED units, we might want to sync.
            // For now, simple logic: if !currentUnits provided in FORM, we run sync? 
            // The form usually sends current value if edited. 
            // Let's stick to consistent logic: if !currentUnits, we sync.
            if (!currentUnits) {
                const { syncInvestmentUnits } = await import('@/lib/sync')
                await syncInvestmentUnits(inv.id)
            }
        }

        revalidatePath('/dashboard')
        revalidatePath('/investments')
        revalidatePath('/goals')
    } catch (error) {
        return { error: "Failed to update investment" }
    }

    redirect('/dashboard')
}

export async function fetchStockDetails(ticker: string) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthorized" }

    try {
        const { getStockDetails } = await import("@/lib/stocks")
        const details = await getStockDetails(ticker)
        if (details) {
            return { success: true, data: details }
        }
        return { error: "Stock not found" }
    } catch (e) {
        return { error: "Failed to fetch stock details" }
    }
}
