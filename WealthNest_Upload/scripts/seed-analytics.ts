import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.findFirst()

    if (!user) {
        console.error("User not found!")
        return
    }

    console.log("Seeding analytics data for user:", user.email)

    const categories = ['Food', 'Transport', 'Rent', 'Shopping', 'Entertainment', 'Health']
    const incomeSources = ['Salary', 'Freelance', 'Dividends']

    // Create expenses for the last 6 months
    for (let i = 0; i < 6; i++) {
        const monthDate = new Date()
        monthDate.setMonth(monthDate.getMonth() - i)
        monthDate.setDate(15) // Mid-month

        // 5-10 expenses per month
        for (let j = 0; j < 8; j++) {
            await prisma.expense.create({
                data: {
                    amount: Math.floor(Math.random() * 2000) + 500,
                    category: categories[Math.floor(Math.random() * categories.length)],
                    date: new Date(monthDate.getTime() + Math.random() * 86400000 * 10), // Spread across days
                    note: `Dummy expense ${i}-${j}`,
                    userId: user.id
                }
            })
        }

        // 1-2 incomes per month
        await prisma.income.create({
            data: {
                amount: 50000 + Math.floor(Math.random() * 10000),
                source: 'Salary',
                date: new Date(monthDate.getTime()),
                userId: user.id
            }
        })

        // Create a Net Worth Snapshot for each month
        const stocks = 50000 + (i * 5000) + Math.floor(Math.random() * 5000);
        const mfs = 40000 + (i * 8000) + Math.floor(Math.random() * 5000);
        const cash = 10000 + Math.floor(Math.random() * 2000);
        const netWorth = stocks + mfs + cash;

        await prisma.snapshot.create({
            data: {
                totalStocks: stocks,
                totalMutualFunds: mfs,
                totalCash: cash,
                totalNetWorth: netWorth,
                date: monthDate,
                userId: user.id
            }
        })
    }

    console.log("Seeding completed!")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
