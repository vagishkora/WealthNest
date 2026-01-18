
import { prisma } from "../lib/prisma";
import { syncInvestmentUnits } from "../lib/sync";

async function main() {
    console.log("Starting full re-sync...");
    const investments = await prisma.investment.findMany();
    console.log(`Found ${investments.length} investments.`);

    for (const inv of investments) {
        if (inv.type !== 'STOCK') {
            console.log(`Syncing ${inv.name}...`);
            await syncInvestmentUnits(inv.id);
        }
    }
    console.log("Sync complete.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
