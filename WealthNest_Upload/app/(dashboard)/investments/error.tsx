'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="flex h-[50vh] flex-col items-center justify-center p-4 text-center">
            <div className="mb-4 rounded-full bg-red-500/10 p-4 text-red-500">
                <AlertCircle size={48} />
            </div>
            <h2 className="mb-2 text-xl font-bold text-white">Something went wrong!</h2>
            <p className="mb-6 max-w-md text-sm text-neutral-400">
                {error.message || "We couldn't load your investments. Please try again."}
            </p>
            <button
                onClick={
                    // Attempt to recover by trying to re-render the segment
                    () => reset()
                }
                className="flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-neutral-200"
            >
                <RefreshCw size={16} />
                Try again
            </button>
        </div>
    )
}
