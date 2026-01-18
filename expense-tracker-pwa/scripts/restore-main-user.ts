
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'vagishkora@gmail.com'
    const password = 'password123' 
    const name = 'Vagish'

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
        console.log(`User ${email} already exists.`)
        return
    }

    console.log(`Creating main user ${email}...`)
    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
        }
    })

    console.log('✅ Main User restored successfully!')
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect())
