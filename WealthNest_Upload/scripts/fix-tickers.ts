
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
    console.log("Fixing tickers...");

    // Fix Indian Oil Corp
    const update = await prisma.investment.updateMany({
        where: {
            name: { contains: 'INDIAN OIL', mode: 'insensitive' },
            type: 'STOCK'
        },
        data: {
            tickerSymbol: 'IOC:NSE'
        }
    });

    console.log(`Updated ${update.count} records for Indian Oil Corp.`);

    // Update Canara Bank ticker
    await prisma.investment.updateMany({
        where: { name: { contains: 'Canara', mode: 'insensitive' } },
        data: { tickerSymbol: 'CANBK:NSE' }
    });
    console.log("Fixed Canara Bank ticker.");
}

fix()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
