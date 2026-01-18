
'use client'

import { Command } from "cmdk"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { useState, useEffect } from "react"
import { clsx } from "clsx"
import { searchStocksAction } from "@/app/actions/stocks"

interface Stock {
    symbol: string;
    name: string;
    exchange: string;
}

export function StockCombobox({ onSelect }: { onSelect: (stock: { name: string, tickerSymbol: string }) => void }) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState("")
    const [selected, setSelected] = useState<string>("")
    const [results, setResults] = useState<Stock[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (search.length < 2) {
                setResults([])
                return
            }

            setLoading(true)
            try {
                const data = await searchStocksAction(search)
                // Filter to only Nifty/Indian stocks ideally if we could, but for now take all
                // Often Indian stocks end in .NS (NSE) or .BO (BSE) on Yahoo
                setResults(data)
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [search])

    return (
        <div className="relative">
            <label className="block text-sm text-neutral-400 mb-1">Select Stock</label>

            <div className="relative">
                <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    className="w-full flex items-center justify-between bg-neutral-950 border border-neutral-800 rounded-lg py-3 px-4 text-white text-left focus:outline-none focus:border-neutral-600"
                >
                    <span className="truncate">{selected || "Search for a stock (e.g. Tata)..."}</span>
                    <ChevronsUpDown className="w-4 h-4 text-neutral-500" />
                </button>
            </div>

            {open && (
                <div className="absolute z-50 top-full mt-1 w-full bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <Command className="bg-transparent" shouldFilter={false}>
                        <div className="flex items-center border-b border-neutral-800 px-3">
                            <Search className="w-4 h-4 text-neutral-500 mr-2" />
                            <Command.Input
                                placeholder="Type to search (e.g. RELIANCE)..."
                                className="flex-1 bg-transparent py-3 text-sm text-white focus:outline-none placeholder-neutral-600"
                                value={search}
                                onValueChange={setSearch}
                                autoFocus
                            />
                        </div>

                        <Command.List className="max-h-60 overflow-y-auto p-1">
                            {loading && <p className="px-3 py-4 text-sm text-neutral-500 text-center">Searching...</p>}

                            {!loading && results.length === 0 && search.length > 2 && (
                                <p className="px-3 py-4 text-sm text-neutral-500 text-center">No stocks found.</p>
                            )}

                            {results.map((stock) => (
                                <Command.Item
                                    key={stock.symbol}
                                    value={stock.symbol}
                                    onSelect={() => {
                                        onSelect({ name: stock.name, tickerSymbol: stock.symbol })
                                        setSelected(`${stock.name} (${stock.symbol})`)
                                        setOpen(false)
                                    }}
                                    className="flex items-center justify-between px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white rounded-lg cursor-pointer"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium text-white">{stock.symbol}</span>
                                        <span className="text-xs text-neutral-500">{stock.name}</span>
                                    </div>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${['NSI', 'NSE', 'BSE', 'BOM'].includes(stock.exchange)
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : 'bg-neutral-800 text-neutral-400'
                                        }`}>
                                        {stock.exchange}
                                    </span>
                                </Command.Item>
                            ))}
                        </Command.List>
                    </Command>
                </div>
            )}
        </div>
    )
}
