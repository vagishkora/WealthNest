
import { prisma } from "./prisma";

export async function syncInvestmentUnits(investmentId: string) {
    const investment = await prisma.investment.findUnique({
        where: { id: investmentId },
        include: { fundReference: true }
    });

    if (!investment || !investment.startDate) return;
    if (!investment.amfiCode && investment.type !== 'SIP') return; // Only allow SIP without AMFI code to proceed (for calculations)

    // Fetch full NAV history for the fund
    // MFAPI format: { meta: {}, data: [{ date: "dd-mm-yyyy", nav: "10.00" }] }
    let history: any[] = [];
    if (investment.amfiCode) {
        try {
            const res = await fetch(`https://api.mfapi.in/mf/${investment.amfiCode}`);
            const json = await res.json();
            if (json.data) history = json.data;
        } catch (e) {
            console.error("Failed to sync units", e);
            // Continue even if sync fails
        }
    }

    // Helper to find closest NAV to a date (Next Business Day Logic)
    // Mutual Fund orders on Sat/Sun get Monday's NAV.
    const findNAV = (targetDate: Date) => {
        if (history.length === 0) return null;

        const targetTime = targetDate.getTime();

        // History is Descending (Newest first).
        // We want the "Oldest date that is >= targetDate".
        // Strategy: Iterate backwards (Ascending) or findLast?
        // history is [Today, Yesterday, ..., 2010]

        // Let's use a specialized loop for finding Next Business Day
        // We look for the entry where date >= targetDate, but closest to it.
        // in Descending list, that means the "last" entry that fulfills date >= targetDate is wrong?
        // No.
        // [Mon, Fri]. Target Sat.
        // Mon >= Sat? Yes.
        // Fri >= Sat? No.
        // We want Mon. It's the "first" match in Descending list?
        // Wait.
        // [Wed, Tue, Mon]. Target Tue.
        // Wed >= Tue? Yes.
        // Tue >= Tue? Yes.
        // Mon >= Tue? No.
        // We want Tue. The "last" match in Descending list that satisfies condition.

        let bestMatch = null;

        // Convert target to timestamp for comparison
        // Reset time to midnight to avoid time mismatches
        const tDate = new Date(targetDate);
        tDate.setHours(0, 0, 0, 0);
        const tTime = tDate.getTime();

        // History is typically Descending (Newest first)
        // Check if target is newer than the newest entry (e.g. today/tomorrow vs yesterday's closing)
        if (history.length > 0) {
            const firstEntry = history[0];
            const [d, m, y] = firstEntry.date.split('-');
            const firstDate = new Date(`${y}-${m}-${d}`);
            if (tTime >= firstDate.getTime()) {
                return parseFloat(firstEntry.nav);
            }
        }

        for (const entry of history) {
            const [day, month, year] = entry.date.split('-');
            const date = new Date(`${year}-${month}-${day}`);
            const dTime = date.getTime();

            // In descending list, we want the first entry that is <= target? 
            // No, strictly Mutual Fund purchase gets NAV of the day (if before cut-off) or next business day.
            // Simplified: Find closest date that is >= targetDate.

            // Descending: [Jan 14, Jan 13, Jan 12]
            // Target: Jan 13.
            // Jan 14 >= Jan 13. Match = Jan 14.
            // Jan 13 >= Jan 13. Match = Jan 13.
            // Jan 12 >= Jan 13. False. Break. Return Jan 13.

            if (dTime >= tTime) {
                bestMatch = entry;
            } else {
                break;
            }
        }

        return bestMatch ? parseFloat(bestMatch.nav) : null;
    };

    let totalUnits = 0;
    let totalInvested = 0;

    // Logic dependent on type
    if (investment.type === 'LUMPSUM') {
        // One time buy at startDate
        totalInvested = investment.amount;
        const nav = findNAV(investment.startDate);
        if (nav) {
            totalUnits = investment.amount / nav;
        }
    } else if (investment.type === 'SIP') {
        let currentDate = new Date(investment.startDate);
        const today = new Date();
        let currentAmount = investment.amount;
        let monthsPassed = 0;

        // Loop through each month from startDate until today
        while (currentDate <= today) {
            // Apply Step-Up every 12 months (if applicable)
            if (investment.stepUpPercentage && monthsPassed > 0 && monthsPassed % 12 === 0) {
                currentAmount = currentAmount * (1 + (investment.stepUpPercentage / 100));
            }

            // Always add to totalInvested regardless of NAV checks
            totalInvested += currentAmount;

            // Only calculate units if we have NAV history
            const nav = findNAV(currentDate);
            if (nav) {
                totalUnits += (currentAmount / nav);
            }

            // Move to next month
            currentDate.setMonth(currentDate.getMonth() + 1);
            monthsPassed++;
        }
    } else {
        return; // Stock or manual
    }

    // Update DB
    await prisma.investment.update({
        where: { id: investment.id },
        data: {
            currentUnits: totalUnits, // Will be 0 if no NAV history
            currentInvestedAmount: totalInvested,
            lastSyncedAt: new Date(),
        }
    });

    return totalUnits;
}
