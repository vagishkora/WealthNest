
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'vagishkora+test@gmail.com'
    const password = 'password123'
    const name = 'Test User'

    console.log(`Checking if user ${email} exists...`)

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
        console.log(`User ${email} already exists.`)
        return
    }

    console.log(`Creating user ${email}...`)
    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
        }
    })

    console.log('✅ User created successfully!')
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)
    console.log('Note: Gmail treats "vagishkora+test@gmail.com" as "vagishkora@gmail.com", so you will receive the OTP in your main inbox.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
