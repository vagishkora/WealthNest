
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const email = 'vagishkora@gmail.com'
    const user = await prisma.user.findUnique({ where: { email } })

    if (user) {
        console.log(`User found: ${user.email} (ID: ${user.id})`)
    } else {
        console.log(`User ${email} NOT FOUND in database.`)
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect())
