
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NewInvestmentForm } from '@/app/(dashboard)/investments/new/form'
import { redirect } from 'next/navigation'

export default async function EditInvestmentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await auth()
    const investment = await prisma.investment.findUnique({
        where: { id, userId: session?.user?.id },
        include: { fundReference: true }
    })

    if (!investment) {
        redirect('/investments')
    }

    const funds = await prisma.fundReference.findMany({
        orderBy: { name: 'asc' },
        take: 100 // Limit initially, combobox handles filtering but ideally searching
    })

    // Prepare initial data. 
    // NewInvestmentForm expects flattened structure somewhat or matches Investment model?
    // Let's check NewInvestmentForm props. It takes initialData.
    // initialData fields: type, name, fundReferenceId, amfiCode, id, etc.
    // We passing the investment object directly should work as it has these fields.
    // amfiCode is on investment OR fundReference. Form expects it on investment-like object.

    const goals = await prisma.goal.findMany({
        where: { userId: session?.user?.id },
        orderBy: { name: 'asc' }
    })

    const initialData = {
        ...investment,
        amfiCode: investment.amfiCode || investment.fundReference?.amfiCode
    }

    return (
        <div className="p-4 bg-neutral-950 min-h-screen">
            <h1 className="text-2xl font-bold text-white mb-6">Edit Investment</h1>
            <NewInvestmentForm funds={funds} goals={goals} initialData={initialData} />
        </div>
    )
}
