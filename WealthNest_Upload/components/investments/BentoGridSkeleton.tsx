"use client";

import { cn } from "@/lib/utils";

export function BentoGridSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)] p-4 max-w-7xl mx-auto animate-pulse">
            {/* Hero Tile Skeleton */}
            <div className="md:col-span-2 md:row-span-2 min-h-[300px] rounded-3xl bg-neutral-900/50 border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] animate-shimmer" />
                <div className="p-8 h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div className="h-10 w-10 rounded-full bg-white/10" />
                        <div className="h-6 w-24 rounded-full bg-white/5" />
                    </div>
                    <div className="space-y-4">
                        <div className="h-4 w-32 bg-white/10 rounded" />
                        <div className="h-12 w-64 bg-white/10 rounded" />
                    </div>
                </div>
            </div>

            {/* Sub Tiles */}
            {[...Array(6)].map((_, i) => (
                <div key={i} className="md:col-span-1 md:row-span-1 min-h-[180px] rounded-3xl bg-neutral-900/50 border border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] animate-shimmer" />
                    <div className="p-5 h-full flex flex-col justify-between">
                        <div className="flex justify-between">
                            <div className="h-8 w-8 rounded-full bg-white/10" />
                            <div className="h-4 w-20 bg-white/5 rounded" />
                        </div>
                        <div className="space-y-2 mt-4">
                            <div className="h-8 w-32 bg-white/10 rounded" />
                            <div className="h-3 w-16 bg-white/5 rounded" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
