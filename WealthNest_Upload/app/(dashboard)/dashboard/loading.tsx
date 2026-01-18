
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="p-4 bg-neutral-950 min-h-screen pb-20 space-y-8">
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-8 w-32 bg-neutral-900" />
                <Skeleton className="h-10 w-10 rounded-full bg-neutral-900" />
            </div>

            {/* Overview Card */}
            <Skeleton className="h-48 w-full rounded-2xl bg-neutral-900" />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-80 w-full rounded-2xl bg-neutral-900" />
                <Skeleton className="h-80 w-full rounded-2xl bg-neutral-900" />
            </div>

            {/* Recent List */}
            <div className="space-y-4">
                <Skeleton className="h-6 w-48 bg-neutral-900" />
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20 w-full rounded-xl bg-neutral-900" />
                    ))}
                </div>
            </div>
        </div>
    )
}
