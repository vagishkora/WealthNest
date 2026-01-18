import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NewInvestmentForm } from './form'

export default async function NewInvestmentPage() {
    const session = await auth()
    if (!session?.user?.id) return null

    const funds = await prisma.fundReference.findMany({
        orderBy: { name: 'asc' }
    })

    const goals = await prisma.goal.findMany({
        where: { userId: session.user.id },
        orderBy: { name: 'asc' }
    })

    return (
        <div className="p-4 max-w-lg mx-auto">
            <h1 className="text-xl font-bold mb-6">Add Investment</h1>
            <NewInvestmentForm funds={funds} goals={goals} />
        </div>
    )
}
