
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SnapshotForm } from './form'

export default async function SnapshotPage() {
    const session = await auth()
    const latestSnapshot = await prisma.snapshot.findFirst({
        where: { userId: session?.user?.id },
        orderBy: { date: 'desc' },
    })

    return (
        <div className="p-4 max-w-lg mx-auto">
            <div className="mb-6 flex items-center gap-2">
                <Link href="/dashboard" className="p-2 -ml-2 text-neutral-400 hover:text-white">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-xl font-bold">Update Portfolio Value</h1>
            </div>

            <SnapshotForm latestSnapshot={latestSnapshot} />

            <p className="mt-4 text-xs text-neutral-500 text-center">
                Enter the current market value of your assets. <br />
                This helps calculate your true Net Worth.
            </p>
        </div>
    )
}
