import { GlassCard } from "@/components/ui/GlassCard"

export default function Loading() {
    return (
        <div className="p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black min-h-screen pb-32 text-white">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <div className="h-8 w-32 bg-neutral-800 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-24 bg-neutral-800 rounded animate-pulse"></div>
                </div>
                <div className="h-10 w-10 bg-neutral-800 rounded-full animate-pulse"></div>
            </div>

            <div className="h-32 w-full bg-neutral-800/50 rounded-2xl animate-pulse mb-8"></div>

            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <GlassCard key={i} className="p-5 h-32 animate-pulse bg-neutral-900/50 flex items-center justify-center">
                        <div className="h-8 w-8 bg-neutral-800 rounded-full"></div>
                    </GlassCard>
                ))}
            </div>
        </div>
    )
}
