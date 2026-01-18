import { format } from "date-fns"

export function downloadCSV(data: any[], filename: string) {
    if (!data || !data.length) {
        alert("No data to export.")
        return
    }

    const headers = Object.keys(data[0])
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
            const value = row[header]
            // Handle commas, quotes, and newlines in data
            if (typeof value === 'string') {
                return `"${value.replace(/"/g, '""')}"`
            }
            if (value instanceof Date) {
                return value.toISOString().split('T')[0]
            }
            if (value === null || value === undefined) {
                return ''
            }
            return value
        }).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', filename)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }
}

export function flattenAllData(data: any) {
    // 1. Investments
    const investments = data.investments.map((inv: any) => ({
        Record_Type: 'INVESTMENT',
        Date: new Date(inv.startDate),
        Category: inv.type, // SIP, LUMPSUM, STOCK
        Name: inv.fundReference ? inv.fundReference.name : inv.name,
        Amount: inv.amount,
        Quantity: inv.quantity || '',
        Price: inv.averageBuyPrice || '',
        Current_Value: inv.currentValue || '',
        Notes: `Code: ${inv.amfiCode || inv.tickerSymbol || '-'}`,
        Source: inv.fundReference ? inv.fundReference.category : '',
        Goal_Name: inv.goalId || '', // Just ID for now, could be enriched if goal map provided
        Status: 'Active'
    }))

    // 2. Expenses
    const expenses = data.expenses.map((exp: any) => ({
        Record_Type: 'EXPENSE',
        Date: new Date(exp.date),
        Category: exp.category,
        Name: exp.shopName || '',
        Amount: -exp.amount, // Negative for expense
        Quantity: '',
        Price: '',
        Current_Value: '',
        Notes: exp.note || '',
        Source: exp.paymentMode || '',
        Goal_Name: '',
        Status: 'Completed'
    }))

    // 3. Incomes
    const incomes = data.incomes.map((inc: any) => ({
        Record_Type: 'INCOME',
        Date: new Date(inc.date),
        Category: inc.category,
        Name: inc.source || '',
        Amount: inc.amount,
        Quantity: '',
        Price: '',
        Current_Value: '',
        Notes: inc.note || '',
        Source: inc.paymentMode || '',
        Goal_Name: '',
        Status: 'Received'
    }))

    // 4. Goals
    const goals = data.goals.map((g: any) => ({
        Record_Type: 'GOAL',
        Date: new Date(g.createdAt),
        Category: 'Financial Goal',
        Name: g.name,
        Amount: g.targetAmount,
        Quantity: '',
        Price: '',
        Current_Value: g.currentAmount,
        Notes: g.deadline ? `Deadline: ${new Date(g.deadline).toLocaleDateString()}` : '',
        Source: '',
        Goal_Name: '',
        Status: g.currentAmount >= g.targetAmount ? 'Reached' : 'In Progress'
    }))

    // Combine and sort by Date (Newest first)
    return [...investments, ...expenses, ...incomes, ...goals].sort((a, b) => b.Date.getTime() - a.Date.getTime())
}
