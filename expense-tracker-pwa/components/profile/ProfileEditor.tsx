'use client'

import { useState } from 'react'
import { updateProfile } from '@/app/actions/profile'
import { Pencil } from 'lucide-react'

export function ProfileEditor({ initialName }: { initialName: string }) {
    const [isEditing, setIsEditing] = useState(false)

    return (
        <div suppressHydrationWarning>
            <div className="flex items-center justify-between mb-2" suppressHydrationWarning>
                <label className="block text-sm text-neutral-400">Full Name</label>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-xs text-neutral-500 hover:text-white flex items-center gap-1 transition-colors"
                    suppressHydrationWarning
                >
                    <Pencil size={12} /> {isEditing ? 'Cancel' : 'Edit'}
                </button>
            </div>

            {isEditing ? (
                <form action={async (formData) => {
                    await updateProfile(formData)
                    setIsEditing(false)
                }} className="flex gap-2">
                    <input
                        name="name"
                        defaultValue={initialName}
                        className="flex-1 bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm focus:border-neutral-700 focus:outline-none"
                        placeholder="Your Name"
                        suppressHydrationWarning
                        autoFocus
                    />
                    <button type="submit" suppressHydrationWarning className="bg-white text-black text-sm px-4 py-2 rounded-md font-medium hover:bg-neutral-200">
                        Save
                    </button>
                </form>
            ) : (
                <div className="text-neutral-200 py-2 border border-transparent" suppressHydrationWarning>
                    {initialName || 'No name set'}
                </div>
            )}
        </div>
    )
}
