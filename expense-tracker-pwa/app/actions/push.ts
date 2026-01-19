"use server";

import webpush from "web-push";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// ⚠️ MOVE THESE TO .env FILES IN PRODUCTION
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BJmdMBTSIo4deg07dLNOkgxgJGiAWCF1bajt7VW9ubIEa3AhagqBSPQ8ZUzXhKybqZjkNmT8JxDKvnU5yFqMfhM";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "o11qCIHh1LRdyTTCJpQDJCCe2hILOFHHJF547CzR0FE";

webpush.setVapidDetails(
    "mailto:support@wealthnest.app",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
);

export async function subscribeUser(sub: PushSubscriptionJSON) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Not authenticated" };

    if (!sub.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
        return { error: "Invalid subscription data" };
    }

    try {
        await prisma.pushSubscription.create({
            data: {
                userId: session.user.id,
                endpoint: sub.endpoint,
                p256dh: sub.keys.p256dh,
                auth: sub.keys.auth,
            },
        });
        return { success: true };
    } catch (error) {
        if ((error as any).code === 'P2002') {
            // Already exists, ignore
            return { success: true };
        }
        console.error("Subscription error:", error);
        return { error: "Failed to save subscription" };
    }
}

export async function unsubscribeUser(endpoint: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Not authenticated" };

    try {
        await prisma.pushSubscription.delete({
            where: { endpoint }
        });
        return { success: true };
    } catch (error) {
        return { error: "Failed to unsubscribe" };
    }
}

export async function sendTestNotification() {
    const session = await auth();
    if (!session?.user?.id) return { error: "Not authenticated" };

    const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId: session.user.id },
    });

    if (subscriptions.length === 0) return { error: "No subscriptions found" };

    const payload = JSON.stringify({
        title: "WealthNest",
        body: "This is a test notification from your Portfolio!",
        url: "/dashboard"
    });

    let successCount = 0;

    for (const sub of subscriptions) {
        try {
            await webpush.sendNotification(
                {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth,
                    },
                },
                payload
            );
            successCount++;
        } catch (error) {
            console.error("Error sending push:", error);
            // Remove invalid subscriptions
            if ((error as any).statusCode === 410 || (error as any).statusCode === 404) {
                await prisma.pushSubscription.delete({ where: { id: sub.id } });
            }
        }
    }

    return { success: true, sentTo: successCount };
}
