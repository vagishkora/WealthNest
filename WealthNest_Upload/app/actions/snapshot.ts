'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function updateSnapshot(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthorized" }

    const totalMutualFunds = parseFloat(formData.get('totalMutualFunds') as string) || 0
    const totalStocks = parseFloat(formData.get('totalStocks') as string) || 0
    const totalCash = parseFloat(formData.get('totalCash') as string) || 0

    const totalNetWorth = totalMutualFunds + totalStocks + totalCash

    try {
        await prisma.snapshot.create({
            data: {
                userId: session.user.id,
                totalMutualFunds,
                totalStocks,
                totalCash,
                totalNetWorth,
                date: new Date(),
            }
        })

        revalidatePath('/dashboard')
    } catch (error) {
        return { error: "Failed to update snapshot" }
    }

    redirect('/dashboard')
}
