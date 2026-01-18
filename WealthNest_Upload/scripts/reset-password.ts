
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    // 1. Find the first user
    const user = await prisma.user.findFirst()

    if (!user) {
        console.error("No user found in the database. You should just SIGN UP.")
        return
    }

    console.log(`Resetting password for: ${user.email}`)

    // 2. Hash new password
    const hashedPassword = await bcrypt.hash("123456", 10)

    // 3. Update
    await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
    })

    console.log("✅ Password successfully reset to: 123456")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
