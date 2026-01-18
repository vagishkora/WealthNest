"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function getExportData() {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    // Fetch all user data
    // We export: Investments, Expenses, Incomes, Snapshots, Goals
    const [investments, expenses, incomes, snapshots, goals] = await Promise.all([
        prisma.investment.findMany({
            where: { userId: session.user.id },
            include: { fundReference: true }
        }),
        prisma.expense.findMany({ where: { userId: session.user.id } }),
        prisma.income.findMany({ where: { userId: session.user.id } }),
        prisma.snapshot.findMany({ where: { userId: session.user.id } }),
        prisma.goal.findMany({ where: { userId: session.user.id } })
    ])

    return {
        exportedAt: new Date().toISOString(),
        version: "1.0",
        data: {
            investments,
            expenses,
            incomes,
            snapshots,
            goals
        }
    }
}
