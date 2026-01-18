
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { WrappedStory } from '@/components/wrapped/WrappedStory'

export default async function WrappedPage() {
    const session = await auth()
    if (!session?.user?.id) redirect('/login')

    // Fetch data for the current year (Jan 1 to Dec 31)
    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 1) // Jan 1st
    const endOfYear = new Date(now.getFullYear(), 11, 31) // Dec 31st

    const expenses = await prisma.expense.findMany({
        where: {
            userId: session.user.id,
            date: { gte: startOfYear, lte: endOfYear }
        }
    })

    const incomes = await prisma.income.findMany({
        where: {
            userId: session.user.id,
            date: { gte: startOfYear, lte: endOfYear }
        }
    })

    if (expenses.length === 0 && incomes.length === 0) {
        return (
            <div className="h-screen flex flex-col items-center justify-center text-white p-6 text-center">
                <h1 className="text-2xl font-bold mb-2">No Data Yet 🎁</h1>
                <p className="text-neutral-400">Add some expenses to unlock your WealthWrapped story!</p>
            </div>
        )
    }

    // --- Calculations ---

    // 1. Total Spent & Income
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0)
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpent) / totalIncome) * 100 : 0

    // 2. Top Category
    const categoryMap: Record<string, number> = {}
    expenses.forEach(e => {
        categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount
    })

    const sortedCategories = Object.entries(categoryMap).sort(([, a], [, b]) => b - a)
    const topCategory = sortedCategories.length > 0 ? sortedCategories[0][0] : 'None'
    const topCategoryAmount = sortedCategories.length > 0 ? sortedCategories[0][1] : 0

    // 3. Most Frequent Day (Weekends vs Weekdays)
    let weekendSpend = 0
    let weekdaySpend = 0
    expenses.forEach(e => {
        const day = e.date.getDay()
        if (day === 0 || day === 6) weekendSpend += e.amount
        else weekdaySpend += e.amount
    })
    const isPartyAnimal = weekendSpend > weekdaySpend

    // 4. Persona Logic
    let persona = "The Balancer"
    let personaDescription = "You keep a healthy mix of spending and saving."
    let personaEmoji = "⚖️"

    if (savingsRate > 50) {
        persona = "The Vault"
        personaDescription = "You save more than most people earn! Incredible discipline."
        personaEmoji = "🏦"
    } else if (savingsRate < 10) {
        persona = "The High Roller"
        personaDescription = "You live life to the fullest! (Maybe too full?)"
        personaEmoji = "💸"
    } else if (topCategory === 'Food' || topCategory === 'Dining') {
        persona = "The Foodie King"
        personaDescription = "Your love language is definitely delicious food."
        personaEmoji = "🍔"
    } else if (topCategory === 'Travel') {
        persona = "The Wanderlust"
        personaDescription = "Catching flights, not feelings."
        personaEmoji = "✈️"
    } else if (topCategory === 'Shopping') {
        persona = "The Trendsetter"
        personaDescription = "Retail therapy is your cardio."
        personaEmoji = "🛍️"
    }

    // Prepare Data Object
    const storyData = {
        year: now.getFullYear(),
        totalSpent,
        totalIncome,
        savingsRate: Math.round(savingsRate),
        topCategory,
        topCategoryAmount,
        isPartyAnimal,
        persona,
        personaDescription,
        personaEmoji
    }

    return (
        <div className="h-[90vh] md:h-screen w-full bg-black flex items-center justify-center overflow-hidden">
            <WrappedStory data={storyData} />
        </div>
    )
}
