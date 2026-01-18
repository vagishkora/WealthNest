
import { auth, signOut } from '@/auth'
import { updateProfile, pauseAccount } from '@/app/actions/profile'
import { AlertTriangle, Pause, User } from 'lucide-react'
import { ProfileEditor } from '@/components/profile/ProfileEditor'
import { DangerZone } from '@/components/profile/DangerZone'

// ...
export default async function ProfilePage() {
    const session = await auth()

    // Server action wrapper to handle sign out client-side if needed, 
    // but actions redirect/signout on server so basic form submission works.

    return (
        <div className="p-4 py-8 max-w-lg mx-auto space-y-8" suppressHydrationWarning>
            <div className="text-center" suppressHydrationWarning>
                <div className="w-20 h-20 bg-neutral-800 rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-neutral-500" suppressHydrationWarning>
                    {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <h2 className="mt-4 text-xl font-semibold">{session?.user?.name}</h2>
                <p className="text-neutral-500">{session?.user?.email}</p>
            </div>

            {/* Edit Profile Section */}
            <div className="bg-neutral-900/50 p-6 rounded-xl border border-white/5 space-y-4" suppressHydrationWarning>
                <h3 className="text-lg font-medium flex items-center gap-2">
                    <User size={18} /> Profile Details
                </h3>
                <ProfileEditor initialName={session?.user?.name || ''} />
            </div>

            {/* Settings */}
            <div className="space-y-4" suppressHydrationWarning>
                <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider ml-1">Settings</h3>

                <form
                    action={async () => {
                        'use server'
                        await signOut({ redirectTo: '/login' })
                    }}
                >
                    <button suppressHydrationWarning className="w-full bg-neutral-900 border border-neutral-800 text-neutral-300 py-3 rounded-lg hover:bg-neutral-800 transition">
                        Sign Out
                    </button>
                </form>
                <DangerZone />
            </div>

            <p className="text-xs text-center text-neutral-600">
                Warning: Deleting your account will permanently erase all investments, snapshots, and goal data. This action cannot be undone.
            </p>
        </div>
    )
}

