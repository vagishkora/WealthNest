
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.findFirst()

    if (!user) {
        console.error("User not found!")
        return
    }

    console.log("Checking expenses for user:", user.email)

    const entertainmentExpenses = await prisma.expense.findMany({
        where: {
            userId: user.id,
            category: 'Entertainment'
        },
        orderBy: { date: 'desc' }
    })

    const total = entertainmentExpenses.reduce((sum, e) => sum + e.amount, 0)

    console.log(`\nTotal 'Entertainment' Expenses: ₹${total}`)
    console.log(`\nSpecific ENTRIES found in database included:`)
    entertainmentExpenses.forEach(e => {
        console.log(`- ${e.date.toLocaleDateString()}: ₹${e.amount} (${e.note || 'No note'})`)
    })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
