import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import webpush from "web-push";
import { formatCurrency } from "@/lib/utils";

// Re-use VAPID keys (ideally from shared config or env)
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BJmdMBTSIo4deg07dLNOkgxgJGiAWCF1bajt7VW9ubIEa3AhagqBSPQ8ZUzXhKybqZjkNmT8JxDKvnU5yFqMfhM";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "o11qCIHh1LRdyTTCJpQDJCCe2hILOFHHJF547CzR0FE";

webpush.setVapidDetails(
    "mailto:support@wealthnest.app",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
);

export async function GET(request: Request) {
    // This endpoint can be called by Vercel Cron or manually on page load
    try {
        const users = await prisma.user.findMany({
            include: {
                pushSubscriptions: true,
                investments: true
            }
        });

        let sentCount = 0;

        for (const user of users) {
            if (user.pushSubscriptions.length === 0) continue;

            // Calculate simple stats
            const totalValue = user.investments.reduce((acc, inv) => acc + (inv.amount || 0), 0); // Approx
            const message = `📈 Daily Update: Your portfolio is tracking at ${formatCurrency(totalValue)}. Tap to see today's moves!`;

            const payload = JSON.stringify({
                title: "WealthNest",
                body: message,
                url: "/dashboard"
            });

            for (const sub of user.pushSubscriptions) {
                try {
                    await webpush.sendNotification({
                        endpoint: sub.endpoint,
                        keys: { p256dh: sub.p256dh, auth: sub.auth }
                    }, payload);
                    sentCount++;
                } catch (e) {
                    // Ignore expired
                }
            }
        }

        return NextResponse.json({ success: true, sent: sentCount });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
