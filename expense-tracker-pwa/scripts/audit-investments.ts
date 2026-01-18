import { PrismaClient } from "@prisma/client"
import { differenceInMonths } from "date-fns"

const prisma = new PrismaClient()

async function audit() {
    const user = await prisma.user.findFirst()
    if (!user) return

    const investments = await prisma.investment.findMany({
        where: { userId: user.id },
        include: { fundReference: true }
    })

    let totalApp = 0

    console.log("--- AUDIT REPORT ---")

    // Check Stocks
    const stocks = investments.filter(i => i.type === 'STOCK')
    for (const s of stocks) {
        const val = (s.quantity || 0) * (s.averageBuyPrice || 0)
        totalApp += val
        // console.log(`STOCK: ${s.tickerSymbol} = ${val.toFixed(2)}`)
    }

    // Check SIPs
    const sips = investments.filter(i => i.type === 'SIP')
    for (const s of sips) {
        const val = s.currentInvestedAmount || 0
        totalApp += val

        // Sim calc
        const months = differenceInMonths(new Date(), s.startDate) + (new Date().getDate() >= s.startDate.getDate() ? 1 : 0)
        const calc = months * s.amount

        console.log(`SIP: ${s.fundReference?.name || s.name} | Stored: ${val} | Calc(${months}m): ${calc} | Diff: ${calc - val}`)
    }

    // Check Lumpsums
    const lumpsums = investments.filter(i => i.type === 'LUMPSUM')
    for (const l of lumpsums) {
        totalApp += l.amount
        // console.log(`LUMP: ${l.fundReference?.name || l.name} = ${l.amount}`)
    }

    console.log(`\nAPP TOTAL: ${totalApp.toFixed(2)}`)
    console.log(`KITE TOTAL: 135774`)
    console.log(`MISSING: ${(135774 - totalApp).toFixed(2)}`)
}

audit().finally(() => prisma.$disconnect())
