'use client'

import { Pause } from 'lucide-react'
import { pauseAccount } from '@/app/actions/profile'
import { useState } from 'react'

export function PauseAccountButton() {
    const [loading, setLoading] = useState(false)

    async function handlePause(formData: FormData) {
        // We can just call the action directly or via form action.
        // But for error handling, let's wrap it.
        // Actually, since it's a form action, we can use client-side invocation too.

        if (!confirm("Are you sure you want to PAUSE your account? You will be logged out and unable to log in until reactivated.")) {
            return
        }

        setLoading(true)
        const res = await pauseAccount()
        if (res?.error) {
            alert(res.error)
            setLoading(false)
        } else {
            // Success, should be signed out.
            window.location.href = '/'
        }
    }

    return (
        <form action={handlePause}>
            <button disabled={loading} className="text-yellow-500 hover:text-yellow-400 p-2 hover:bg-yellow-500/10 rounded-md transition-colors" title="Pause Account">
                <Pause size={20} className={loading ? "animate-pulse" : ""} />
            </button>
        </form>
    )
}
