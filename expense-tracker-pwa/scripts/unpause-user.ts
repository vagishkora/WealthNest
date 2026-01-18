
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const email = 'vagishkora@gmail.com'
    console.log(`Unpausing account for ${email}...`)

    await prisma.user.update({
        where: { email },
        data: { isPaused: false }
    })

    console.log('✅ Account Unpaused! You should be able to login now.')
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect())
