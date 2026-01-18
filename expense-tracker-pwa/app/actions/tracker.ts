
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addIncome(data: {
    amount: number;
    source: string;
    category: string;
    paymentMode: string;
    date: Date;
    note?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.income.create({
        data: {
            userId: session.user.id,
            amount: data.amount,
            source: data.source,
            category: data.category,
            paymentMode: data.paymentMode,
            date: data.date,
            note: data.note
        }
    });

    revalidatePath("/tracker");
}

export async function addExpense(data: {
    amount: number;
    category: string;
    shopName?: string;
    paymentMode: string;
    date: Date;
    note?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.expense.create({
        data: {
            userId: session.user.id,
            amount: data.amount,
            category: data.category,
            shopName: data.shopName,
            paymentMode: data.paymentMode,
            date: data.date,
            note: data.note
        }
    });

    revalidatePath("/tracker");
}

export async function editIncome(id: string, data: {
    amount: number;
    source: string;
    category: string;
    paymentMode: string;
    date: Date;
    note?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.income.update({
        where: { id, userId: session.user.id },
        data: {
            amount: data.amount,
            source: data.source,
            category: data.category,
            paymentMode: data.paymentMode,
            date: data.date,
            note: data.note
        }
    });

    revalidatePath("/tracker");
}

export async function editExpense(id: string, data: {
    amount: number;
    category: string;
    shopName?: string;
    paymentMode: string;
    date: Date;
    note?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.expense.update({
        where: { id, userId: session.user.id },
        data: {
            amount: data.amount,
            category: data.category,
            shopName: data.shopName,
            paymentMode: data.paymentMode,
            date: data.date,
            note: data.note
        }
    });

    revalidatePath("/tracker");
}

export async function deleteTransaction(type: 'INCOME' | 'EXPENSE', id: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    if (type === 'INCOME') {
        await prisma.income.delete({ where: { id, userId: session.user.id } });
    } else {
        await prisma.expense.delete({ where: { id, userId: session.user.id } });
    }

    revalidatePath("/tracker");
}

export async function getSummary(rangeType: string = '1M', customMonth?: number, customYear?: number) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    let startDate = new Date();
    let endDate = new Date();

    // Set End Date to End of Day today (or end of specific month if browsing history)
    endDate.setHours(23, 59, 59, 999);

    const today = new Date();

    if (rangeType === 'CUSTOM' && customMonth !== undefined && customYear !== undefined) {
        startDate = new Date(customYear, customMonth, 1);
        endDate = new Date(customYear, customMonth + 1, 0);
    } else {
        // Relative ranges
        switch (rangeType) {
            case '1M': // Current Month
                startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                break;
            case '3M': // Past 3 Months
                startDate = new Date(today.getFullYear(), today.getMonth() - 2, 1);
                break;
            case '6M': // Past 6 Months
                startDate = new Date(today.getFullYear(), today.getMonth() - 5, 1);
                break;
            case '1Y': // Last 12 Months
                startDate = new Date(today.getFullYear() - 1, today.getMonth(), 1);
                break;
            case 'ALL': // Since beginning
                startDate = new Date(0); // Epoch
                break;
            default:
                startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        }
    }

    const [incomes, expenses, allIncomes, allExpenses] = await Promise.all([
        prisma.income.findMany({
            where: {
                userId: session.user.id,
                date: { gte: startDate, lte: endDate }
            },
            orderBy: { date: 'desc' }
        }),
        prisma.expense.findMany({
            where: {
                userId: session.user.id,
                date: { gte: startDate, lte: endDate }
            },
            orderBy: { date: 'desc' }
        }),
        // Fetch ALL TIME aggregates for Wallet Balance
        prisma.income.aggregate({
            where: { userId: session.user.id },
            _sum: { amount: true }
        }),
        prisma.expense.aggregate({
            where: { userId: session.user.id },
            _sum: { amount: true }
        })
    ]);

    const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

    // Global Wallet Balance (All Time)
    const globalIncome = allIncomes._sum.amount || 0;
    const globalExpense = allExpenses._sum.amount || 0;
    const totalWalletBalance = globalIncome - globalExpense;

    // Category Breakdown
    const categoryMap = new Map<string, number>();
    expenses.forEach(exp => {
        const current = categoryMap.get(exp.category) || 0;
        categoryMap.set(exp.category, current + exp.amount);
    });

    const categoryBreakdown = Array.from(categoryMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    return {
        totalIncome,
        totalExpense,
        balance, // Period Balance
        totalWalletBalance, // Global Balance
        savingsRate,
        categoryBreakdown,
        incomes,
        expenses
    };
}
