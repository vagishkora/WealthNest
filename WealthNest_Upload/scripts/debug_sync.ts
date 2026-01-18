
import { syncInvestmentUnits } from '../lib/sync';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // The ID we found earlier
    const id = '1363066c-70ab-4d20-bf0a-f88294d135cd';
    console.log(`Syncing investment: ${id}`);

    // We can't easily hook into syncInvestmentUnits logs unless we add them back to lib/sync.ts
    // OR we fetch manually here.

    const res = await fetch(`https://api.mfapi.in/mf/119132`);
    const json = await res.json();
    console.log('Latest MFAPI Data:', json.data.slice(0, 3));

    const units = await syncInvestmentUnits(id);
    console.log(`Sync complete. Units: ${units}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
