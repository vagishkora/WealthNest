'use client'

import { updateSnapshot } from '@/app/actions/snapshot'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SnapshotForm({ latestSnapshot }: { latestSnapshot: any }) {
    const [error, setError] = useState('')
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        const res = await updateSnapshot(formData)
        if (res?.error) {
            setError(res.error)
        }
        // If success, it redirects, so we don't need to do anything here necessarily, 
        // providing the server action redirects.
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <div className="bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800 space-y-4">

                <FormInput
                    label="Total Mutual Fund Value"
                    name="totalMutualFunds"
                    defaultValue={latestSnapshot?.totalMutualFunds}
                    placeholder="0.00"
                />

                <FormInput
                    label="Total Stock Value"
                    name="totalStocks"
                    defaultValue={latestSnapshot?.totalStocks}
                    placeholder="0.00"
                />

                <FormInput
                    label="Cash / Bank Balance"
                    name="totalCash"
                    defaultValue={latestSnapshot?.totalCash}
                    placeholder="0.00"
                />

            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button type="submit" className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-neutral-200 transition">
                Save Snapshot
            </button>
        </form>
    )
}

function FormInput({ label, name, defaultValue, placeholder }: any) {
    return (
        <div>
            <label className="block text-sm text-neutral-400 mb-1">{label}</label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">₹</span>
                <input
                    name={name}
                    type="number"
                    step="0.01"
                    defaultValue={defaultValue}
                    placeholder={placeholder}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-3 pl-8 pr-4 text-white focus:outline-none focus:border-neutral-600"
                />
            </div>
        </div>
    )
}
