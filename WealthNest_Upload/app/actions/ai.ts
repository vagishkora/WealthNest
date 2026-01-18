'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' })

export async function getSpendingInsights() {
    const session = await auth()
    if (!session?.user?.id) return { error: "Not authenticated" }

    if (!process.env.GROQ_API_KEY) {
        // Fallback to Mock/Demo Mode if key is missing
        await new Promise(resolve => setTimeout(resolve, 1500)) // Fake delay
        const tips = [
            "💡 **Tip**: You spent 20% more on dining this month. Try cooking at home this weekend!",
            "💰 **Savings**: Great job! You've saved ₹2,000 more than last month.",
            "📊 **Budget**: You are 80% through your shopping budget. Slow down!",
            "🚀 **Goal**: You're on track to hit your 'New Laptop' goal by December.",
            "☕ **Habit**: Cutting one coffee a day could save you ₹300/week."
        ]
        return {
            insight: tips[Math.floor(Math.random() * tips.length)] + "\n\n*(Demo Mode: Add valid API Key for personalized AI tips)*"
        }
    }

    try {
        // Fetch recent transactions (last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const expenses = await prisma.expense.findMany({
            where: {
                userId: session.user.id,
                date: { gte: thirtyDaysAgo }
            },
            orderBy: { date: 'desc' },
            take: 50 // Limit content size
        })

        const incomes = await prisma.income.findMany({
            where: {
                userId: session.user.id,
                date: { gte: thirtyDaysAgo }
            }
        })

        if (expenses.length === 0) {
            return { insight: "Start tracking your expenses to get personalized AI insights!" }
        }

        // Prepare data summary for AI
        const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
        const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0)

        const categoryBreakdown = expenses.reduce((acc, e) => {
            acc[e.category] = (acc[e.category] || 0) + e.amount
            return acc
        }, {} as Record<string, number>)

        const topCategories = Object.entries(categoryBreakdown)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([cat, amount]) => `${cat}: ₹${amount}`)
            .join(', ')

        const recentTransactions = expenses.slice(0, 10).map(e => `- ${e.category}: ₹${e.amount} (${e.note || 'no note'})`).join('\n')

        const prompt = `
            Act as a financial advisor. Analyze my last 30 days of expenses:
            
            **Summary:**
            - Total Income: ₹${totalIncome}
            - Total Spent: ₹${totalSpent}
            - Top Categories: ${topCategories}
            - Transaction Count: ${expenses.length}

            **Recent Transactions (Sample):**
            ${recentTransactions}

            **Task:**
            Give me 3 creative and actionable **money-saving hacks** or **optimization strategies** based on this data.
            Avoid generic "Stop spending" advice. Instead, suggest **smart alternatives** (e.g., "Switch to annual subscriptions", "Use X card for cashback", "Meal prep checks").
            Focus on how to *grow* wealth (investing the savings) rather than just restricting lifestyle.
            Keep it under 60 words total. Use emojis.
            Do not say "Based on the data". Just give the tips.
        `

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: "llama-3.3-70b-versatile",
        });

        return { insight: completion.choices[0]?.message?.content || "No insights generated." }

    } catch (error: any) {
        console.error("AI Insights Error:", {
            message: error.message,
            status: error.status,
            details: error.response?.data || error
        })

        // Return actual error to UI for debugging (temporarily, or conditionally)
        // If it's a "Demo Mode" fallback, clarify why.

        return {
            error: `AI Error: ${error.message || 'Unknown error'}. Please check API Key.`
        }
    }
}

export async function parseTransactionFromText(text: string) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Not authenticated" }

    if (!process.env.GROQ_API_KEY) {
        return { error: "AI Service Unavailable (Missing Key)" }
    }

    try {
        const prompt = `
            Extract transaction details from this text: "${text}"
            
            Return ONLY a raw JSON object (no markdown, no backticks) with these fields:
            - amount (number)
            - category (string, map to closest: Food, Transport, Shopping, Entertainment, Health, Bills, Rent, Salary, Freelance, Investment, Other)
            - note (string, short description)
            - type (string, either 'EXPENSE' or 'INCOME')

            Example: "Spent 500 on lunch" -> { "amount": 500, "category": "Food", "note": "lunch", "type": "EXPENSE" }
            Example: "Got salary 50k" -> { "amount": 50000, "category": "Salary", "note": "Salary", "type": "INCOME" }
        `

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
        });

        const content = completion.choices[0]?.message?.content || "{}"
        // Clean up markdown if present
        const jsonString = content.replace(/```json/g, '').replace(/```/g, '').trim()

        try {
            const parsed = JSON.parse(jsonString)
            return { data: parsed }
        } catch (e) {
            console.error("Failed to parse AI JSON:", content)
            return { error: "Failed to understand transaction." }
        }

    } catch (error: any) {
        console.error("AI Parse Error:", error)
        return { error: error.message || "AI Error" }
    }
}
