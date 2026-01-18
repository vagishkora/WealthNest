
'use server'

import { parseCasPdf } from "@/lib/cas-parser";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function processCasUpload(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    const file = formData.get('file') as File;
    const password = formData.get('password') as string;

    if (!file) {
        return { error: "No file provided" };
    }

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        let data;

        // Determine file type
        const lowerName = file.name.toLowerCase();
        if (lowerName.endsWith('.pdf')) {
            data = await parseCasPdf(buffer, password);
        } else if (lowerName.match(/\.(xlsx|xls|csv)$/)) {
            try {
                const { parseExcel } = await import('@/lib/cas-parser');
                data = await parseExcel(buffer);
            } catch (e: any) {
                return { error: "Excel parsing failed: " + e.message };
            }
        } else {
            return { error: "Unsupported file type. Please upload PDF, Excel (.xlsx), or CSV." };
        }

        // We assume the parsing returns valid schemes.
        // We do NOT save to DB yet. We return data for User Confirmation.

        // Let's filter only valid purchases
        const foundSchemes = data.schemes.filter(s => s.transactions.length > 0);

        if (foundSchemes.length === 0) {
            return { error: "No transactions found. Ensure valid format." };
        }

        return { success: true, data: foundSchemes };

    } catch (error: any) {
        console.error("Upload Error:", error);
        return { error: error.message || "Failed to process file" };
    }
}

export async function saveImportedData(selectedSchemes: any[]) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    let savedCount = 0;

    try {
        for (const scheme of selectedSchemes) {
            // scheme has transactions[]
            for (const txn of scheme.transactions) {
                // Only import Inflows (Purchases)
                if (txn.type === 'PURCHASE' || txn.type === 'SIP' || txn.type === 'SWITCH_IN' || txn.type === 'DIVIDEND') {

                    const date = new Date(txn.date);

                    // Check duplicate: User + Name + Date + Amount
                    // This prevents re-importing the same transaction multiple times
                    const exists = await prisma.investment.findFirst({
                        where: {
                            userId: session.user.id,
                            name: scheme.name, // Using Scheme Name as Investment Name
                            startDate: date,
                            amount: txn.amount,
                            type: 'LUMPSUM' // Imported are treated as one-off lumpsums
                        }
                    });

                    if (!exists) {
                        await prisma.investment.create({
                            data: {
                                userId: session.user.id,
                                name: scheme.name,
                                type: 'LUMPSUM',
                                amount: txn.amount,
                                quantity: txn.units || null,
                                currentUnits: txn.units || null, // Initialize current units
                                currentInvestedAmount: txn.amount,
                                startDate: date,
                                // We don't have fundReferenceId or amfiCode yet. 
                                // User can map it later or we add auto-mapper.
                            }
                        });
                        savedCount++;
                    }
                }
            }
        }

        return { success: true, count: savedCount };

    } catch (error: any) {
        console.error("Save Error:", error);
        return { error: "Failed to save investments: " + error.message };
    }
}
