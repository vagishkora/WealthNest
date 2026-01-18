

import { FloatingNav } from '@/components/FloatingNav'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen flex-col bg-neutral-950 text-neutral-100" suppressHydrationWarning>
            <main className="flex-1 overflow-y-auto pb-32">
                {children}
            </main>
            <FloatingNav />
        </div>
    )
}
