"use client";

import { useEffect } from "react";
import { useAppLock } from "@/context/AppLockContext";
import { getUserPin } from "@/app/actions/auth";
import { useSession } from "next-auth/react";

export function PinSync() {
    const { setupLock, isSetup } = useAppLock();
    const { data: session } = useSession();

    useEffect(() => {
        // Only sync if user is logged in and PIN is NOT set locally yet
        if (session?.user?.email && !isSetup) {
            async function sync() {
                const res = await getUserPin(session!.user!.email!);
                if (res.pin) {
                    // Sync PIN from Server to LocalStorage
                    setupLock(res.pin);
                    // Do not show lock screen immediately on first sync to avoid confusing loop?
                    // setupLock sets isLocked=false by default.
                }
            }
            sync();
        }
    }, [session, isSetup, setupLock]);

    return null;
}
