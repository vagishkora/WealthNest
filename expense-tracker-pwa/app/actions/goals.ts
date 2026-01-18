'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function createGoal(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthorized" }

    const name = formData.get("name") as string
    const targetAmount = parseFloat(formData.get("targetAmount") as string)
    const currentAmount = parseFloat(formData.get("currentAmount") as string) || 0
    const deadlineStr = formData.get("deadline") as string

    if (!name || isNaN(targetAmount)) {
        return { error: "Name and Target Amount are required" }
    }

    try {
        await prisma.goal.create({
            data: {
                userId: session.user.id,
                name,
                targetAmount,
                currentAmount,
                deadline: deadlineStr ? new Date(deadlineStr) : null
            }
        })
        revalidatePath('/dashboard')
        revalidatePath('/goals')
        return { success: true }
    } catch (error: any) {
        return { error: "Failed to create goal" }
    }
}

export async function updateGoal(id: string, formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthorized" }

    const name = formData.get("name") as string
    const targetAmount = parseFloat(formData.get("targetAmount") as string)
    const currentAmount = parseFloat(formData.get("currentAmount") as string)
    const deadlineStr = formData.get("deadline") as string

    if (!id || !name) return { error: "Invalid Data" }

    try {
        await prisma.goal.update({
            where: { id, userId: session.user.id },
            data: {
                name,
                targetAmount,
                currentAmount,
                deadline: deadlineStr ? new Date(deadlineStr) : null
            }
        })
        revalidatePath('/dashboard')
        revalidatePath('/goals')
        return { success: true }
    } catch (error) {
        return { error: "Failed to update goal" }
    }
}

export async function deleteGoal(id: string) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthorized" }

    try {
        await prisma.goal.delete({
            where: { id, userId: session.user.id }
        })
        revalidatePath('/dashboard')
        revalidatePath('/goals')
        return { success: true }
    } catch (error) {
        return { error: "Failed to delete goal" }
    }
}
