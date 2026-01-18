import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function fix() {
    const user = await prisma.user.findFirst()
    if (!user) return

    console.log("Fixing Portfolio Gaps...")

    // 1. CANBK Stock
    await prisma.investment.create({
        data: {
            userId: user.id,
            type: 'STOCK',
            name: 'CANBK',
            tickerSymbol: 'CANBK',
            quantity: 10,
            averageBuyPrice: 109.49,
            amount: 1094.90,
            startDate: new Date("2025-01-01") // Approx date
        }
    })
    console.log("Created STOCK: CANBK (1094.90)")

    // 2. Parag Parikh Missing Amount
    // We attach to the existing Fund ID if possible, but finding it by name is safer check
    const ppfas = await prisma.fundReference.findFirst({
        where: { name: { contains: "Parag Parikh Flexi Cap" } }
    })

    await prisma.investment.create({
        data: {
            userId: user.id,
            type: 'LUMPSUM',
            name: ppfas?.name || "Parag Parikh Flexi Cap Fund",
            amount: 1001.27,
            startDate: new Date("2025-01-01"),
            fundReferenceId: ppfas?.id,
            currentInvestedAmount: 1001.27
        }
    })
    console.log("Created OBSERVED_GAP: PPFAS (1001.27)")

    // 3. HDFC Gold Missing Amount
    const gold = await prisma.fundReference.findFirst({
        where: { name: { contains: "HDFC Gold" } }
    })

    await prisma.investment.create({
        data: {
            userId: user.id,
            type: 'LUMPSUM',
            name: gold?.name || "HDFC Gold ETF",
            amount: 548.92,
            startDate: new Date("2025-01-01"),
            fundReferenceId: gold?.id,
            currentInvestedAmount: 548.92
        }
    })
    console.log("Created OBSERVED_GAP: HDFC Gold (548.92)")

    console.log("--- FIX COMPLETE ---")
}

fix().finally(() => prisma.$disconnect())
