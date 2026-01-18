import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// Helper for PDF-safe currency (removes ₹ symbol which breaks jspdf default fonts)
function formatCurrencyPDF(amount: number) {
    return "Rs. " + amount.toLocaleString('en-IN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
    })
}

export function generatePDF(data: any) {
    const doc = new jsPDF()

    // Title
    doc.setFontSize(22)
    doc.setTextColor(40, 40, 40)
    doc.text("WealthNest Comprehensive Report", 14, 20)

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 26)

    let finalY = 35

    // --- CALCULATIONS ---
    const sips = data.investments.filter((i: any) => i.type === 'SIP')
    const lumpsums = data.investments.filter((i: any) => i.type === 'LUMPSUM')
    const stocks = data.investments.filter((i: any) => i.type === 'STOCK')

    const totalMonthlySIP = sips.reduce((acc: number, i: any) => acc + i.amount, 0)
    const totalSIPValue = sips.reduce((acc: number, i: any) => acc + (i.currentInvestedAmount || i.amount), 0)
    const totalLumpsumValue = lumpsums.reduce((acc: number, i: any) => acc + i.amount, 0)
    const totalStockValue = stocks.reduce((acc: number, i: any) => acc + (i.quantity * i.averageBuyPrice), 0)
    const totalInvestedCapital = totalSIPValue + totalLumpsumValue + totalStockValue

    const totalExpense = data.expenses.reduce((acc: number, exp: any) => acc + exp.amount, 0)
    const totalIncome = data.incomes.reduce((acc: number, inc: any) => acc + inc.amount, 0)
    const netWorth = totalInvestedCapital + (totalIncome - totalExpense)

    // --- 1. EXECUTIVE SUMMARY ---
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text("1. Executive Summary", 14, finalY)

    autoTable(doc, {
        startY: finalY + 5,
        head: [['Metric', 'Value']],
        body: [
            ['Net Worth (Est.)', formatCurrencyPDF(netWorth)],
            ['Total Invested Capital', formatCurrencyPDF(totalInvestedCapital)],
            ['Monthly SIP Commitment', formatCurrencyPDF(totalMonthlySIP)],
            ['Total Income', formatCurrencyPDF(totalIncome)],
            ['Total Expenses', formatCurrencyPDF(totalExpense)],
            ['Current Balance (Cash Flow)', formatCurrencyPDF(totalIncome - totalExpense)],
        ],
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129], halign: 'left' },
        columnStyles: {
            0: { halign: 'left' },
            1: { fontStyle: 'bold', halign: 'right' }
        }
    })

    // @ts-ignore
    finalY = doc.lastAutoTable.finalY + 10

    // --- 2. SIP INVESTMENTS ---
    doc.text("2. SIP Investments (Active)", 14, finalY)

    if (sips.length > 0) {
        autoTable(doc, {
            startY: finalY + 5,
            head: [['Fund Name', 'Category', 'Start Date', 'Monthly', 'Total Inv.']],
            body: sips.map((i: any) => [
                i.fundReference?.name || i.name,
                i.fundReference?.category || 'Mutual Fund',
                new Date(i.startDate).toLocaleDateString(),
                formatCurrencyPDF(i.amount),
                formatCurrencyPDF(i.currentInvestedAmount || 0)
            ]),
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246] },
            columnStyles: {
                3: { halign: 'right' },
                4: { halign: 'right' }
            }
        })
        // @ts-ignore
        finalY = doc.lastAutoTable.finalY + 10
    } else {
        doc.setFontSize(10); doc.setTextColor(150);
        doc.text("(No Active SIPs)", 14, finalY + 5);
        finalY += 15; doc.setFontSize(14); doc.setTextColor(0);
    }

    // --- 3. LUMPSUM INVESTMENTS ---
    doc.text("3. Lumpsum Investments", 14, finalY)

    if (lumpsums.length > 0) {
        autoTable(doc, {
            startY: finalY + 5,
            head: [['Fund Name', 'Category', 'Date', 'Amount']],
            body: lumpsums.map((i: any) => [
                i.fundReference?.name || i.name,
                i.fundReference?.category || 'Mutual Fund',
                new Date(i.startDate).toLocaleDateString(),
                formatCurrencyPDF(i.amount)
            ]),
            theme: 'striped',
            headStyles: { fillColor: [14, 165, 233] },
            columnStyles: {
                3: { halign: 'right' }
            }
        })
        // @ts-ignore
        finalY = doc.lastAutoTable.finalY + 10
    } else {
        doc.setFontSize(10); doc.setTextColor(150);
        doc.text("(No Lumpsum Investments)", 14, finalY + 5);
        finalY += 15; doc.setFontSize(14); doc.setTextColor(0);
    }

    // --- 4. STOCK HOLDINGS ---
    doc.text("4. Stock Holdings", 14, finalY)

    if (stocks.length > 0) {
        autoTable(doc, {
            startY: finalY + 5,
            head: [['Ticker', 'Name', 'Qty', 'Avg Price', 'Invested', 'Cur. Value']],
            body: stocks.map((i: any) => {
                const invested = i.quantity * i.averageBuyPrice
                const curVal = i.currentValue
                    ? formatCurrencyPDF(i.currentValue)
                    : 'N/A'

                return [
                    i.tickerSymbol || '-',
                    i.name,
                    i.quantity,
                    formatCurrencyPDF(i.averageBuyPrice),
                    formatCurrencyPDF(invested),
                    curVal
                ]
            }),
            theme: 'striped',
            headStyles: { fillColor: [139, 92, 246] },
            columnStyles: {
                2: { halign: 'center' }, // Qty
                3: { halign: 'right' }, // Avg Price
                4: { halign: 'right' }, // Invested
                5: { halign: 'right' }  // Cur Value
            }
        })
        // @ts-ignore
        finalY = doc.lastAutoTable.finalY + 10
    } else {
        doc.setFontSize(10); doc.setTextColor(150);
        doc.text("(No Stock Holdings)", 14, finalY + 5);
        finalY += 15; doc.setFontSize(14); doc.setTextColor(0);
    }

    // --- 5. FINANCIAL GOALS ---
    doc.text("5. Financial Goals", 14, finalY)

    if (data.goals.length > 0) {
        autoTable(doc, {
            startY: finalY + 5,
            head: [['Goal Name', 'Target', 'Saved', 'Progress', 'Remaining']],
            body: data.goals.map((g: any) => [
                g.name,
                formatCurrencyPDF(g.targetAmount),
                formatCurrencyPDF(g.currentAmount),
                `${Math.round((g.currentAmount / g.targetAmount) * 100)}%`,
                formatCurrencyPDF(Math.max(0, g.targetAmount - g.currentAmount))
            ]),
            theme: 'striped',
            headStyles: { fillColor: [234, 179, 8] },
            columnStyles: {
                1: { halign: 'right' },
                2: { halign: 'right' },
                3: { halign: 'center' },
                4: { halign: 'right' }
            }
        })
        // @ts-ignore
        finalY = doc.lastAutoTable.finalY + 10
    } else {
        doc.setFontSize(10); doc.setTextColor(150);
        doc.text("(No Financial Goals)", 14, finalY + 5);
        finalY += 15; doc.setFontSize(14); doc.setTextColor(0);
    }

    // --- 6. RECENT INCOME & EXPENSES ---
    doc.addPage() // Start new page for transactions
    doc.text("6. Expenses & Income History", 14, 20)

    const transactions = [
        ...data.expenses.map((e: any) => ({ ...e, type: 'EXPENSE' })),
        ...data.incomes.map((i: any) => ({ ...i, type: 'INCOME' }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    autoTable(doc, {
        startY: 25,
        head: [['Date', 'Type', 'Category / Source', 'Amount', 'Notes']],
        body: transactions.map((t: any) => [
            new Date(t.date).toLocaleDateString(),
            t.type,
            t.type === 'EXPENSE' ? t.category : t.source,
            formatCurrencyPDF(t.amount),
            t.note || t.description || '-'
        ]),
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 3) {
                const isExpense = (data.row.raw as any)[1] === 'EXPENSE'
                data.cell.styles.textColor = isExpense ? [220, 38, 38] : [22, 163, 74] // Red vs Green
            }
        },
        theme: 'plain',
        columnStyles: {
            3: { halign: 'right' }
        }
    })

    doc.save("wealthnest-comprehensive-report.pdf")
}
