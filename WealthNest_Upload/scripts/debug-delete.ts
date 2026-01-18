
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const email = 'debug-delete@example.com'

    // 1. Clean up if exists
    try {
        await prisma.user.delete({ where: { email } })
        console.log('Cleaned up existing debug user.')
    } catch (e) { }

    // 2. Create User
    console.log('Creating user...')
    const user = await prisma.user.create({
        data: {
            email,
            password: 'password',
            name: 'Debug User'
        }
    })

    // 3. Add related data (to test cascade)
    console.log('Adding data...')
    await prisma.goal.create({
        data: {
            userId: user.id,
            name: 'Debug Goal',
            targetAmount: 1000
        }
    })

    // 4. Try Delete
    console.log('Attempting delete...')
    try {
        await prisma.user.delete({
            where: { id: user.id }
        })
        console.log('✅ Delete successful! Cascade works.')
    } catch (error) {
        console.error('❌ Delete FAILED:', error)
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect())
