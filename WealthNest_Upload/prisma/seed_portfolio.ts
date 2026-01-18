
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // 1. Find the user (Assuming single user or specific email)
    // IMPORTANT: Since we don't know the exact user ID, we'll try to find the first user created.
    const user = await prisma.user.findFirst()

    if (!user) {
        console.error("No user found. Please sign up first.")
        return
    }

    console.log(`Seeding portfolio for user: ${user.email} (${user.id})`)

    // Clear existing investments to ensure fresh start with correct dates
    await prisma.investment.deleteMany({
        where: { userId: user.id }
    })
    console.log("Cleared existing investments.")

    // 2. Define the portfolio data (Extracted from Screenshots)
    // Strategy: Set currentUnits manually so calculations are exact immediately.
    // Set lastSyncedAt so the background sync doesn't overwrite it immediately.
    const investments = [
        {
            name: "Nippon India Multi Cap Fund",
            amfiCode: "118650",
            type: "LUMPSUM",
            amount: 9999.38,
            currentUnits: 30.460,
            startDate: new Date('2025-07-29'), // Exact date from sheet
            averageBuyPrice: 328.28
        },
        {
            name: "UTI Nifty 50 Index Fund",
            amfiCode: "120716",
            type: "LUMPSUM",
            amount: 14999.25,
            currentUnits: 87.088,
            startDate: new Date('2025-07-29'), // Major tranche date
            averageBuyPrice: 172.23
        },
        {
            name: "HDFC Gold ETF Fund of Fund",
            amfiCode: "119064",
            type: "SIP",
            amount: 21498.91,
            currentUnits: 680.776,
            startDate: new Date('2025-03-05'), // First visible SIP in 2025
            averageBuyPrice: 31.58,
            stepUpPercentage: 10
        },
        {
            name: "Parag Parikh Flexi Cap Fund",
            amfiCode: "122639",
            type: "SIP",
            amount: 27998.31,
            currentUnits: 310.920,
            startDate: new Date('2024-08-19'), // Start date from sheet
            averageBuyPrice: 90.05
        },
        {
            name: "JioBlackRock Flexi Cap Fund",
            amfiCode: "INF22M001093",
            type: "LUMPSUM",
            amount: 1999.90,
            currentUnits: 196.454,
            startDate: new Date('2025-12-02'), // From sheet
            averageBuyPrice: 10.18
        },
        {
            name: "Motilal Oswal Large and Midcap Fund",
            amfiCode: "147964",
            type: "LUMPSUM",
            amount: 9999.59,
            currentUnits: 272.617,
            startDate: new Date('2025-07-29'), // From sheet
            averageBuyPrice: 36.68
        },
        {
            name: "HDFC Small Cap Fund",
            amfiCode: "130503",
            type: "LUMPSUM",
            amount: 4999.71,
            currentUnits: 31.037,
            startDate: new Date('2025-07-29'), // From sheet
            averageBuyPrice: 161.09
        }
    ]

    for (const inv of investments) {
        // Check if already exists to avoid dupes?
        // Simple check by name
        const exists = await prisma.investment.findFirst({
            where: { userId: user.id, name: inv.name }
        })

        if (!exists) {
            await prisma.investment.create({
                data: {
                    userId: user.id,
                    name: inv.name,
                    amfiCode: inv.amfiCode,
                    type: inv.type as any,
                    // To handle this cleanly: For seed data, 'amount' should be installment for SIP, and we manually set 'currentInvestedAmount'.
                    // BUT: user provided TOTAL invested.
                    // Correction: Dashboard logic I will write will prefer 'currentInvestedAmount'.

                    // Actually, let's derive monthly installment for HDFC Gold SIP: 550. Parag Parikh: 1000.
                    // This is safer for future syncs.
                    amount: inv.type === 'SIP' && inv.name.includes("HDFC Gold") ? 550 :
                        inv.type === 'SIP' && inv.name.includes("Parag Parikh") ? 1000 :
                            inv.amount,

                    currentUnits: inv.currentUnits,
                    currentInvestedAmount: inv.amount, // The user provided TOTAL invested.
                    averageBuyPrice: inv.averageBuyPrice,
                    startDate: inv.startDate,
                    lastSyncedAt: new Date(), // Mark as synced so it persists manual units
                    stepUpPercentage: inv.stepUpPercentage
                }
            })
            console.log(`Created: ${inv.name}`)
        } else {
            console.log(`Skipped (Exists): ${inv.name}`)
        }
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
