'use client'

import { Trash2 } from 'lucide-react'
import { deleteAccount } from '@/app/actions/profile'
import { useState } from 'react'

export function DeleteAccountButton() {
    const [loading, setLoading] = useState(false)

    async function handleDelete(e: React.FormEvent) {
        e.preventDefault()
        if (!confirm("ARE YOU SURE? This will permanently delete your account and all data. This cannot be undone.")) {
            return
        }

        setLoading(true)
        const res = await deleteAccount()
        if (res?.error) {
            alert(res.error)
            setLoading(false)
        } else {
            // Success - redirect to home/login
            window.location.href = '/'
        }
    }

    return (
        <form onSubmit={handleDelete}>
            <button disabled={loading} className="text-red-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-md transition-colors" title="Delete Account">
                <Trash2 size={20} className={loading ? "animate-pulse" : ""} />
            </button>
        </form>
    )
}
