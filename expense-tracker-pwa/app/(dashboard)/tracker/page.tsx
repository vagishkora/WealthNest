
import { auth } from "@/auth";
import { getSummary } from "@/app/actions/tracker";
import { SummaryCards } from "@/components/tracker/SummaryCards";
import { TrackerCharts } from "@/components/tracker/TrackerCharts";
import { TransactionTable } from "@/components/tracker/TransactionTable";
import { GradientText } from "@/components/ui/GlassCard";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import { Download } from "lucide-react";

const TIME_RANGES = [
    { label: "This Month", value: "1M" },
    { label: "3 Months", value: "3M" },
    { label: "6 Months", value: "6M" },
    { label: "1 Year", value: "1Y" },
    { label: "All Time", value: "ALL" },
];

export default async function TrackerPage({
    searchParams
}: {
    searchParams: { range?: string; month?: string; year?: string }
}) {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const params = await searchParams;
    const range = params.range || "1M";

    // Pass range to summary
    const summary = await getSummary(range,
        params.month ? parseInt(params.month) : undefined,
        params.year ? parseInt(params.year) : undefined
    );

    return (
        <div className="p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black min-h-screen pb-32 text-white" suppressHydrationWarning>
            <div className="max-w-6xl mx-auto" suppressHydrationWarning>
                {/* Header with Time Range Selector */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6" suppressHydrationWarning>
                    <h1 className="text-3xl font-bold">
                        <GradientText>Financial Dashboard</GradientText>
                    </h1>

                    <div className="flex flex-wrap items-center gap-4" suppressHydrationWarning>
                        <a
                            href={`/api/export?range=${range}`}
                            target="_blank"
                            className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition text-neutral-400 hover:text-white"
                        >
                            <Download size={14} /> Export CSV
                        </a>

                        <div className="flex flex-wrap justify-center items-center gap-2 bg-white/5 border border-white/10 rounded-full p-1" suppressHydrationWarning>
                            {TIME_RANGES.map((r) => (
                                <Link
                                    key={r.value}
                                    href={`/tracker?range=${r.value}`}
                                    className={cn(
                                        "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition",
                                        range === r.value
                                            ? "bg-white text-black shadow-lg"
                                            : "text-neutral-400 hover:text-white hover:bg-white/10"
                                    )}
                                >
                                    {r.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Premium Summary Cards */}
                <div suppressHydrationWarning>
                    <SummaryCards
                        income={summary.totalIncome}
                        expense={summary.totalExpense}
                        balance={summary.balance}
                        savingsRate={summary.savingsRate}
                        totalWalletBalance={summary.totalWalletBalance}
                    />
                </div>

                {/* Visual Charts */}
                <div suppressHydrationWarning>
                    <TrackerCharts
                        income={summary.totalIncome}
                        expense={summary.totalExpense}
                        categoryBreakdown={summary.categoryBreakdown}
                    />
                </div>

                {/* Transaction Tables (Refined Layout) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" suppressHydrationWarning>
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-0 overflow-hidden flex flex-col h-[600px]" suppressHydrationWarning>
                        <div className="p-4 bg-emerald-500/5 border-b border-emerald-500/10 flex-shrink-0" suppressHydrationWarning>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">Income Log</h3>
                        </div>
                        <div className="p-4 flex-1 overflow-y-auto min-h-0" suppressHydrationWarning>
                            <TransactionTable type="INCOME" data={summary.incomes} />
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-0 overflow-hidden flex flex-col h-[600px]" suppressHydrationWarning>
                        <div className="p-4 bg-rose-500/5 border-b border-rose-500/10 flex-shrink-0" suppressHydrationWarning>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400">Expense Log</h3>
                        </div>
                        <div className="p-4 flex-1 overflow-y-auto min-h-0" suppressHydrationWarning>
                            <TransactionTable type="EXPENSE" data={summary.expenses.map(e => ({
                                ...e,
                                shopName: e.shopName || undefined
                            }))} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
