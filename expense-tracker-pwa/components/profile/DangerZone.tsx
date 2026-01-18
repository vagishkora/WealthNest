'use client'

import { useState } from 'react'
import { AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react'
import { DeleteAccountButton } from './DeleteAccountButton'

export function DangerZone() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="border border-red-500/10 rounded-xl overflow-hidden" suppressHydrationWarning>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-red-950/5 hover:bg-red-950/10 transition-colors"
                suppressHydrationWarning
            >
                <div className="flex items-center gap-2 text-red-500/80 font-medium" suppressHydrationWarning>
                    <AlertTriangle size={16} />
                    <span>Danger Zone</span>
                </div>
                {isOpen ? <ChevronDown size={16} className="text-red-500/50" /> : <ChevronRight size={16} className="text-red-500/50" />}
            </button>

            {isOpen && (
                <div className="p-6 bg-red-950/10 border-t border-red-500/10 space-y-4" suppressHydrationWarning>
                    <div className="flex items-center justify-between" suppressHydrationWarning>
                        <div suppressHydrationWarning>
                            <p className="font-medium text-red-400">Delete Account</p>
                            <p className="text-xs text-red-500/70">Permanently delete all data</p>
                        </div>
                        <DeleteAccountButton />
                    </div>
                </div>
            )}
        </div>
    )
}
