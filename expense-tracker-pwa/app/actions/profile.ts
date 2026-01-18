'use server'

import { auth } from "@/auth" // or "@/auth.ts" depending on export
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { signOut } from "@/auth"
import { redirect } from "next/navigation"

export async function updateProfile(formData: FormData) {
    const session = await auth()
    if (!session || !session.user || !session.user.email) {
        return { error: "Not authenticated" }
    }

    const name = formData.get('name') as string
    if (!name || name.trim().length < 2) {
        return { error: "Name must be at least 2 characters" }
    }

    try {
        await prisma.user.update({
            where: { email: session.user.email },
            data: { name }
        })
        revalidatePath('/dashboard')
        revalidatePath('/profile')
        return { success: true }
    } catch (error) {
        return { error: "Failed to update profile" }
    }
}

export async function pauseAccount() {
    const session = await auth()
    console.log('PAUSE DEBUG SESSION:', JSON.stringify(session, null, 2))

    if (!session?.user?.email) return { error: "Not authenticated" }

    try {
        // Toggle pause
        // First get current state to toggle, or just set to true?
        // User asked for "Pause", usually implies setting to true.
        // But if they are logged in, they are active.
        // Let's assume this action sets it to TRUE (Pause), and they need to "Unpause" via a different flow or email?
        // OR: Simple toggle if we allow them to log in but show a "Paused" screen.

        await prisma.user.update({
            where: { email: session.user.email },
            data: { isPaused: true }
        })

        // Sign out immediately
        await signOut({ redirect: false })
        return { success: true }
    } catch (error) {
        return { error: "Failed to pause account" }
    }
}

export async function deleteAccount() {
    const session = await auth()
    if (!session?.user?.email) return { error: "Not authenticated" }

    try {
        console.log(`Attempting to delete user: ${session.user.email}`)
        // Cascade delete handles relations
        await prisma.user.delete({
            where: { email: session.user.email }
        })

    } catch (error: any) {
        console.error('DELETE ERROR:', error)

        // P2025: Record to delete does not exist. 
        // This means the user is already deleted from DB, but still has a session cookie.
        // We should treat this as success and just sign them out.
        if (error.code === 'P2025') {
            await signOut({ redirect: false })
            return { success: true }
        }

        return { error: `Failed to delete: ${error.message || error}` }
    }
}
