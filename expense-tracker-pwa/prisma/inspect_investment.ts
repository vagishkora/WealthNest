
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Find the investment with amount 550 or 5500 (approx) or by name
    const investments = await prisma.investment.findMany({
        where: { name: { contains: 'Gold' } }
    });

    investments.forEach(inv => {
        console.log(`ID: ${inv.id}`);
        console.log(`Name: ${inv.name}`);
        console.log(`Type: ${inv.type}`);
        console.log(`StartDate: ${inv.startDate.toISOString()}`); // Check year!
        console.log(`Amount: ${inv.amount}`);
        console.log(`Invested: ${inv.currentInvestedAmount}`);
        console.log(`Units: ${inv.currentUnits}`);
        console.log('-------------------');
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
