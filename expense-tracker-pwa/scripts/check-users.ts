
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Checking recent users...')
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
    })

    console.log('--- RECENT USERS ---')
    users.forEach(u => {
        console.log(`Email: ${u.email}, Name: "${u.name}", Created: ${u.createdAt.toISOString()}`)
    })
    console.log('--------------------')
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect())
