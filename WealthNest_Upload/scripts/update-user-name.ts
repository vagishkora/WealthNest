
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const email = 'vagishkora@gmail.com'
    const newName = 'Vagish'

    console.log(`Updating name for ${email} to "${newName}"...`)

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { name: newName }
        })
        console.log('✅ Name updated successfully!')
        console.log(`User: ${user.email}, Name: ${user.name}`)
    } catch (error) {
        console.error("Error updating user:", error)
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect())
