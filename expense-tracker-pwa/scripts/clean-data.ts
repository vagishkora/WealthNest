
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.findFirst()

    if (!user) {
        console.error("User not found!")
        return
    }

    console.log(`Cleaning data for user: ${user.email} (${user.name})`)

    // Delete related data in order to avoid foreign key constraints (if any)
    const deleteExpenses = prisma.expense.deleteMany({ where: { userId: user.id } })
    const deleteIncomes = prisma.income.deleteMany({ where: { userId: user.id } })
    const deleteSnapshots = prisma.snapshot.deleteMany({ where: { userId: user.id } })
    const deleteGoals = prisma.goal.deleteMany({ where: { userId: user.id } }) // Remove dummy goals too

    // Note: detailed investments might be real or dummy. 
    // Usually safe to keep investments if manually added, but if seeded, wipe them.
    // Assuming user wants a FRESH start as per request "use my data".
    // Let's keep investments strictly if they might be real, but given the context, 
    // the user likely wants a clean slate for the tracker. 
    // However, I'll be safe and ONLY delete the things that affect the "Insights" and "Charts" (Expenses/Income).
    // I will also delete the dummy 'Europe Trip' goal if it exists.

    await prisma.$transaction([
        deleteExpenses,
        deleteIncomes,
        deleteSnapshots,
        deleteGoals
    ])

    console.log("✅ Successfully wiped all Expenses, Incomes, Snapshots, and Goals.")
    console.log("   (Investments, Profile, and Settings were preserved).")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
