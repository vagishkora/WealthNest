"use client";

import { useEffect, useState } from "react";
import { subscribeUser, sendTestNotification } from "@/app/actions/push";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { urlBase64ToUint8Array } from "@/lib/push-utils";

const VAPID_PUBLIC_KEY = "BJmdMBTSIo4deg07dLNOkgxgJGiAWCF1bajt7VW9ubIEa3AhagqBSPQ8ZUzXhKybqZjkNmT8JxDKvnU5yFqMfhM";

export function PushManager() {
    const [isSupported, setIsSupported] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [loading, setLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        // Move the check inside useEffect to avoid hydration mismatches
        if ("serviceWorker" in navigator && "PushManager" in window) {
            setIsSupported(true);
            checkSubscription();
        }
    }, []);

    async function checkSubscription() {
        try {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration) {
                const sub = await registration.pushManager.getSubscription();
                if (sub) {
                    console.log("Found existing subscription:", sub);
                    setSubscription(sub);
                }
            }
        } catch (error) {
            console.error("Error checking subscription:", error);
        }
    }

    async function subscribe() {
        console.log("Starting subscription sequence...");
        setLoading(true);
        try {
            if (!("serviceWorker" in navigator)) {
                throw new Error("Service Worker not supported");
            }

            // 1. Ensure Service Worker is registered
            let registration = await navigator.serviceWorker.getRegistration();
            if (!registration) {
                console.log("No SW found, registering...");
                // Try to register explicitly if next-pwa didn't do it
                registration = await navigator.serviceWorker.register("/notification-sw.js");
                console.log("SW Registered manually:", registration);

                // Wait for it to be active
                await new Promise<void>((resolve) => {
                    if (registration?.active) resolve();
                    registration!.addEventListener('updatefound', () => {
                        const newWorker = registration!.installing;
                        newWorker?.addEventListener('statechange', () => {
                            if (newWorker.state === 'activated') resolve();
                        });
                    });
                });
            } else {
                console.log("Existing SW found:", registration);
            }

            // 2. Wait for Ready (can hang if SW is broken)
            console.log("Waiting for SW ready...");
            const readyReg = await navigator.serviceWorker.ready;
            console.log("SW Ready!", readyReg);

            // 3. Subscribe
            console.log("Subscribing with key...", VAPID_PUBLIC_KEY);
            const sub = await readyReg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });

            console.log("Push Subscription Object:", sub);
            setSubscription(sub);

            // 4. Send to Server
            console.log("Sending to server...");
            const res = await subscribeUser(sub.toJSON());
            console.log("Server Action Response:", res);

            if (res.success) {
                toast.success("Notifications enabled successfully!");
            } else {
                toast.error("Failed to save to server: " + res.error);
            }

        } catch (error: any) {
            console.error("FULL SUBSCRIBE ERROR:", error);
            toast.error("Subscription failed: " + error.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleTest() {
        setLoading(true);
        try {
            const res = await sendTestNotification();
            if (res.success) {
                toast.success(`Sent to ${res.sentTo} devices!`);
            } else {
                toast.error("Failed to send: " + res.error);
            }
        } catch (e) {
            toast.error("Error calling server");
        } finally {
            setLoading(false);
        }
    }

    // Prevent hydration mismatch by not rendering until mounted
    if (!isMounted) return null;

    if (!isSupported) {
        return <div className="text-sm text-neutral-500">Push notifications are not supported on this device.</div>;
    }

    return (
        <div className="flex flex-col gap-4 p-4 border border-white/10 rounded-xl bg-white/5">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-white">Push Notifications</h3>
                    <p className="text-xs text-neutral-400">Receive alerts about your portfolio logic.</p>
                </div>
                {subscription ? (
                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                        <Bell size={16} /> Enabled
                    </div>
                ) : (
                    <button
                        onClick={subscribe}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/50 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : "Enable"}
                    </button>
                )}
            </div>

            {subscription && (
                <button
                    onClick={handleTest}
                    className="self-start w-full px-4 py-2 rounded-lg text-sm font-bold bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? "Sending..." : "Send Test Notification"}
                </button>
            )}
        </div>
    );
}
