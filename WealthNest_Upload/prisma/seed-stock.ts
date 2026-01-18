
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'demo@example.com' } // Assuming demo user or first user
    }) || await prisma.user.findFirst()

    if (!user) {
        console.error("No user found")
        return
    }

    await prisma.investment.create({
        data: {
            userId: user.id,
            name: 'Reliance Industries',
            tickerSymbol: 'RELIANCE.NS',
            type: 'STOCK',
            amount: 50000,
            quantity: 20, // Avg price 2500
            startDate: new Date('2024-01-01')
        }
    })

    console.log("Seeded RELIANCE stock")
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
