
import { differenceInCalendarMonths, isBefore, startOfMonth } from 'date-fns';

export function calculateSIPTotalInvested(amount: number, startDate: Date, currentDate: Date = new Date()): number {
    if (isBefore(currentDate, startDate)) {
        return 0;
    }

    // Example: Start Jan 10, Current Feb 15.
    // Months: Jan, Feb. Total 2.
    // differenceInCalendarMonths(Feb 15, Jan 10) = 1.
    // We want to count both Jan and Feb if the SIP date has passed in the current month?
    // Let's assume SIP happens on the same day of month as startDate.

    const monthsDiff = differenceInCalendarMonths(currentDate, startDate);

    // If we want to be precise about "has the SIP date passed this month?":
    // But usually "Monthly SIP" implies count of months.
    // Excel formula approach: Month difference + 1 (for inclusive start month) is a safe approximation for "months started".

    return amount * (monthsDiff + 1);
}

export function calculatePortfolioSummary(investments: any[], currentValues: { mutualFund?: number, stock?: number, cash?: number }) {
    let totalInvestedMF = 0;
    let totalInvestedStocks = 0;

    investments.forEach(inv => {
        if (inv.type === 'SIP') {
            totalInvestedMF += calculateSIPTotalInvested(inv.amount, new Date(inv.startDate));
        } else if (inv.type === 'LUMPSUM') {
            totalInvestedMF += inv.amount;
        } else if (inv.type === 'STOCK') {
            if (inv.quantity && inv.averageBuyPrice) {
                totalInvestedStocks += inv.quantity * inv.averageBuyPrice;
            }
        }
    });

    return {
        invested: {
            mutualFunds: totalInvestedMF,
            stocks: totalInvestedStocks,
            total: totalInvestedMF + totalInvestedStocks
        },
        current: {
            mutualFunds: currentValues.mutualFund || 0,
            stocks: currentValues.stock || 0,
            cash: currentValues.cash || 0,
            netWorth: (currentValues.mutualFund || 0) + (currentValues.stock || 0) + (currentValues.cash || 0)
        }
    };
}
