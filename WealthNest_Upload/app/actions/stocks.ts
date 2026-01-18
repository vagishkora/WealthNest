
'use server'

import { searchStocks } from "@/lib/stocks"

export async function searchStocksAction(query: string) {
    if (!query || query.length < 2) return []
    return await searchStocks(query)
}
