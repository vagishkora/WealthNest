
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.findFirst()

    if (!user) {
        console.error("User not found!")
        return
    }

    console.log(`Cleanup started for user: ${user.email}`)

    // 1. Delete Dummy Expenses
    const { count: expenseCount } = await prisma.expense.deleteMany({
        where: {
            userId: user.id,
            note: { startsWith: 'Dummy expense' }
        }
    })
    console.log(`✅ Deleted ${expenseCount} 'Dummy' Expenses.`)

    // 2. Delete One Specific Goal
    const { count: goalCount } = await prisma.goal.deleteMany({
        where: {
            userId: user.id,
            name: 'Europe Trip 2026'
        }
    })
    console.log(`✅ Deleted ${goalCount} sample 'Europe Trip' Goal(s).`)

    // 3. Delete Generated Snapshots (heuristic: based on specific cash range from seed)
    // Seed: cash = 10000 + random(2000) -> 10000 to 12000
    // This is distinct enough to likely filter out real user input unless coincidental.
    const { count: snapshotCount } = await prisma.snapshot.deleteMany({
        where: {
            userId: user.id,
            totalCash: { gte: 10000, lte: 12000 },
            totalStocks: { gte: 50000 }, // Seed minimum
        }
    })
    console.log(`✅ Deleted ${snapshotCount} generated Net Worth Snapshots.`)

    // 4. Incomes - We skip 'Salary' deletions to be safe as user might have real salary.
    console.log("ℹ️  Skipped Income deletion to avoid removing real Salary entries.")

    console.log("\nCleanup Complete! Your manual data should be intact.")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
