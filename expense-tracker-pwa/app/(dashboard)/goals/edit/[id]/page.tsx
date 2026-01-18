
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NewGoalForm } from './form'
import { notFound } from 'next/navigation'

export default async function EditGoalPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await auth()

    const goal = await prisma.goal.findUnique({
        where: { id, userId: session?.user?.id }
    })

    if (!goal) return notFound()

    return (
        <div className="p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black min-h-screen text-white flex flex-col items-center justify-center">
            <NewGoalForm initialData={goal} />
        </div>
    )
}
