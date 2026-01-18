
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.findFirst()

    if (!user) {
        console.error("User not found!")
        return
    }

    console.log("Seeding sample goal for user:", user.email)

    // Check if goal already exists
    const existing = await prisma.goal.findFirst({
        where: { userId: user.id, name: "Europe Trip 2026" }
    })

    if (!existing) {
        await prisma.goal.create({
            data: {
                userId: user.id,
                name: "Europe Trip 2026",
                targetAmount: 300000,
                currentAmount: 85000, // Manual Savings
                deadline: new Date('2026-06-15')
            }
        })
        console.log("Created 'Europe Trip' goal!")
    } else {
        console.log("Goal already exists.")
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
