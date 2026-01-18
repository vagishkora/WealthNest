
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


async function checkInvestments() {
    const investments = await prisma.investment.findMany({
        where: {
            type: 'STOCK'
        }
    });
    console.log("Stock Investments:", JSON.stringify(investments.map(i => ({ name: i.name, ticker: i.tickerSymbol })), null, 2));
}


checkInvestments()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
