
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const investments = await prisma.investment.findMany({
        select: {
            id: true,
            name: true,
            type: true,
            amfiCode: true,
            tickerSymbol: true,
            fundReference: {
                select: {
                    name: true,
                    amfiCode: true
                }
            }
        }
    })

    console.log("Investments Check:", JSON.stringify(investments, null, 2))
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
