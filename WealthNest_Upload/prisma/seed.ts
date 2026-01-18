
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Fetching funds from MFAPI...')

    try {
        const response = await fetch('https://api.mfapi.in/mf')
        if (!response.ok) throw new Error('Failed to fetch from MFAPI')

        const funds = await response.json()
        console.log(`Fetched ${funds.length} funds. seeding...`)

        // Chunk the inserts to avoid memory issues with SQLite/Prisma
        for (const fund of funds) {
            const code = String(fund.schemeCode)
            try {
                // Try to find by official code first, then by name
                const existing = await prisma.fundReference.findFirst({
                    where: {
                        OR: [
                            { amfiCode: code },
                            { name: fund.schemeName }
                        ]
                    }
                })

                if (existing) {
                    await prisma.fundReference.update({
                        where: { id: existing.id },
                        data: {
                            amfiCode: code,
                            code: code, // syncing internal code too
                        }
                    })
                } else {
                    await prisma.fundReference.create({
                        data: {
                            name: fund.schemeName,
                            amfiCode: code,
                            code: code,
                            category: 'Mutual Fund',
                        }
                    })
                }
            } catch (e) {
                // Ignore unique constraint errors if purely parallel race condition, but log others
                console.error(`Failed to process ${fund.schemeName}`)
            }
            if (funds.indexOf(fund) % 1000 === 0) console.log(`Processed ${funds.indexOf(fund)} funds...`)
        }

        console.log('Seeding finished successfully.')

    } catch (err) {
        console.error('Error seeding funds:', err)
    }
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
