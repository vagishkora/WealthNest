
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const email = 'vagishkora@gmail.com'
    const user = await prisma.user.findUnique({ where: { email } })

    if (user) {
        console.log(`✅ User FOUND:`)
        console.log(`ID: ${user.id}`)
        console.log(`Email: ${user.email}`)
        console.log(`Name: ${user.name}`)
        console.log(`Paused: ${user.isPaused}`)
        console.log(`Password (Hash): ${user.password.substring(0, 10)}...`)
    } else {
        console.log(`❌ User ${email} NOT FOUND in database.`)
        console.log(`(This explains why login fails if you deleted the account!)`)
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect())
