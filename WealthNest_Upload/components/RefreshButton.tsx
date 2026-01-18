'use client'

import { refreshData } from "@/app/actions/refresh"
import { RefreshCw } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function RefreshButton({ className }: { className?: string }) {
    const [loading, setLoading] = useState(false)

    const handleRefresh = async () => {
        setLoading(true)
        try {
            await refreshData()
        } finally {
            setTimeout(() => setLoading(false), 1000) // min spin time
        }
    }

    return (
        <button
            onClick={handleRefresh}
            disabled={loading}
            className={cn("p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition", className)}
            title="Refresh Prices"
        >
            <RefreshCw size={18} className={cn(loading && "animate-spin")} />
        </button>
    )
}
