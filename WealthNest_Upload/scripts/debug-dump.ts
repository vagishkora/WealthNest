import { PrismaClient } from "@prisma/client"
import * as fs from 'fs'

const prisma = new PrismaClient()

async function dump() {
    const user = await prisma.user.findFirst()
    if (!user) return

    const investments = await prisma.investment.findMany({
        where: { userId: user.id },
        include: { fundReference: true }
    })

    fs.writeFileSync('debug-data.json', JSON.stringify(investments, null, 2))
    console.log("Dumped to debug-data.json")
}

dump().finally(() => prisma.$disconnect())
