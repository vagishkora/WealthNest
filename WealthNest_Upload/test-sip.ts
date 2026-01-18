
import { syncInvestmentUnits } from './lib/sync'
import { prisma } from './lib/prisma'

async function main() {
    // 1. Create a dummy Test SIP (Generic so no AMFI code)
    const inv = await prisma.investment.create({
        data: {
            userId: 'test-user', // Won't work if FK constraint but let's try or fetch existing
            type: 'SIP',
            name: 'Test Generic SIP',
            amount: 1000,
            startDate: new Date('2023-01-01'), // 1 year ago ~= 12-13 installments
            currentInvestedAmount: 0 // Start fresh
        }
    })

    console.log("Created Test SIP:", inv.id)

    // 2. Run Sync
    await syncInvestmentUnits(inv.id)

    // 3. Check Result
    const updated = await prisma.investment.findUnique({ where: { id: inv.id } })
    console.log("Updated SIP:", JSON.stringify(updated, null, 2))

    // Cleanup
    await prisma.investment.delete({ where: { id: inv.id } })
}

// Helper to mocked user if needed (assuming test-user exists or we pick one)
async function run() {
    const user = await prisma.user.findFirst()
    if (!user) { console.error("No user"); return }

    // Create dummy
    const inv = await prisma.investment.create({
        data: {
            userId: user.id,
            type: 'SIP',
            name: 'Test Generic SIP',
            amount: 1000,
            startDate: new Date('2024-01-01'), // ~12 months ago from Jan 2025
            currentInvestedAmount: 0
        }
    })

    console.log(`Created SIP: ${inv.id} with Start Date: ${inv.startDate.toISOString()}`)

    await syncInvestmentUnits(inv.id)

    const updated = await prisma.investment.findUnique({ where: { id: inv.id } })
    console.log("Invested Amount:", updated?.currentInvestedAmount)
    console.log("Expected ~13000 assuming it ran monthly until today")

    await prisma.investment.delete({ where: { id: inv.id } })
}

run()
