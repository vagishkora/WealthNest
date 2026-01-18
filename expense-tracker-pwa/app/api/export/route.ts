
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { format } from "date-fns"; // Standard date formatting if available, or native

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "1M";

    // Date Logic
    const now = new Date();
    let startDate = new Date();

    if (range === '1M') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (range === '3M') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    } else if (range === '6M') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    } else if (range === '1Y') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    } else if (range === 'ALL') {
        startDate = new Date(0); // Epoch
    }

    const [incomes, expenses] = await Promise.all([
        prisma.income.findMany({
            where: {
                userId: session.user.id,
                date: { gte: startDate }
            },
            orderBy: { date: 'desc' }
        }),
        prisma.expense.findMany({
            where: {
                userId: session.user.id,
                date: { gte: startDate }
            },
            orderBy: { date: 'desc' }
        })
    ]);

    // ---------------------------------------------------------
    // GENERATE RICH CSV
    // ---------------------------------------------------------

    // 1. Summary Section (Top of File)
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netSavings = totalIncome - totalExpense;

    const summaryRows = [
        `WEALTHNEST FINANCIAL REPORT`,
        `Generated On,${new Date().toLocaleString()}`,
        `Report Period,${range === 'ALL' ? 'All Time' : 'Last ' + range}`,
        ``,
        `TOTAL INCOME,${totalIncome.toFixed(2)}`,
        `TOTAL EXPENSES,${totalExpense.toFixed(2)}`,
        `NET SAVINGS,${netSavings.toFixed(2)}`,
        ``,
        `DETAILED TRANSACTION LOG`,
        ``
    ].join("\n");

    // 2. Detailed Headers
    const headers = [
        "Date",
        "Day",
        "Type",
        "Category",
        "Payer / Vendor", // Combined Source/ShopName
        "Payment Mode",
        "Notes",
        "Amount (INR)"
    ].join(",");

    // 3. Data Rows
    // Merge and sort by date descending
    const allTransactions = [
        ...incomes.map(i => ({ ...i, type: "INCOME", entity: i.source })),
        ...expenses.map(e => ({ ...e, type: "EXPENSE", entity: e.shopName || "-" }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const dataRows = allTransactions.map(t => {
        const dateObj = new Date(t.date);

        // Format: 16-Jan-2026
        const dateStr = dateObj.toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        });

        // Format: Friday
        const dayStr = dateObj.toLocaleDateString('en-US', {
            weekday: 'long'
        });

        // Clean strings to prevent CSV breakage
        const clean = (str: string | null | undefined) => `"${(str || "").replace(/"/g, '""')}"`;

        return [
            clean(dateStr),
            clean(dayStr),
            clean(t.type),
            clean(t.category),
            clean(t.entity),
            clean(t.paymentMode),
            clean(t.note),
            // Amount: Incomes positive, Expenses negative? Or just absolute with Type column?
            // Let's keep absolute but Type column clearly says Expense
            t.amount.toFixed(2)
        ].join(",");
    });

    const csvContent = summaryRows + headers + "\n" + dataRows.join("\n");

    return new NextResponse(csvContent, {
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="WealthNest_Detailed_Report_${range}.csv"`
        }
    });
}
