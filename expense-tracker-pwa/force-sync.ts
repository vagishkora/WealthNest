
import { prisma } from "./lib/prisma"
import { syncInvestmentUnits } from "./lib/sync"

async function main() {
    console.log("Fetching SIPs...")
    const investments = await prisma.investment.findMany({
        where: { type: 'SIP' }, // Focus on SIPs as they were the issue
        select: { id: true, name: true, startDate: true }
    })

    console.log(`Found ${investments.length} SIPs to sync.`)

    for (const inv of investments) {
        console.log(`Syncing: ${inv.name}`)
        await syncInvestmentUnits(inv.id)
    }

    console.log("Done.")
}

main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
