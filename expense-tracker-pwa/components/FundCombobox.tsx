'use client'

import { Command } from "cmdk"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { useState, useEffect } from "react"
import { clsx } from "clsx"

interface Fund {
    schemeCode: string;
    schemeName: string;
}

export function FundCombobox({ onSelect }: { onSelect: (fund: { name: string, amfiCode: string | null }) => void }) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState("")
    const [selected, setSelected] = useState<string>("")
    const [results, setResults] = useState<Fund[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (search.length < 2) {
                setResults([])
                return
            }

            setLoading(true)
            try {
                const res = await fetch(`https://api.mfapi.in/mf/search?q=${search}`)
                const data = await res.json()
                setResults(data.slice(0, 50))
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
            <label className="block text-sm text-neutral-400 mb-1">Select Fund</label>

            <div className="relative">
                <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    className="w-full flex items-center justify-between bg-neutral-950 border border-neutral-800 rounded-lg py-3 px-4 text-white text-left focus:outline-none focus:border-neutral-600"
                >
                    <span className="truncate">{selected || "Search for a mutual fund..."}</span>
                    <ChevronsUpDown className="w-4 h-4 text-neutral-500" />
                </button>
            </div>

            {open && (
                <div className="absolute z-50 top-full mt-1 w-full bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <Command className="bg-transparent" shouldFilter={false}>
                        <div className="flex items-center border-b border-neutral-800 px-3">
                            <Search className="w-4 h-4 text-neutral-500 mr-2" />
                            <Command.Input
                                placeholder="Type to search (e.g. HDFC)..."
                                className="flex-1 bg-transparent py-3 text-sm text-white focus:outline-none placeholder-neutral-600"
                                value={search}
                                onValueChange={setSearch}
                                autoFocus
                            />
                        </div>

                        <Command.List className="max-h-60 overflow-y-auto p-1">
                            {loading && <p className="px-3 py-4 text-sm text-neutral-500 text-center">Searching...</p>}

                            {!loading && results.length === 0 && search.length > 2 && (
                                <p className="px-3 py-4 text-sm text-neutral-500 text-center">No funds found.</p>
                            )}

                            {!loading && results.length === 0 && search.length <= 2 && (
                                <p className="px-3 py-4 text-sm text-neutral-500 text-center">Type at least 2 characters...</p>
                            )}

                            {results.map((fund) => (
                                <Command.Item
                                    key={fund.schemeCode}
                                    value={fund.schemeName} // Value for internal cmdk matching (disabled above)
                                    onSelect={() => {
                                        onSelect({ name: fund.schemeName, amfiCode: fund.schemeCode })
                                        setSelected(fund.schemeName)
                                        setOpen(false)
                                    }}
                                    className="flex items-center px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white rounded-lg cursor-pointer"
                                >
                                    <Check
                                        className={clsx(
                                            "mr-2 h-4 w-4",
                                            selected === fund.schemeName ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {fund.schemeName}
                                </Command.Item>
                            ))}
                        </Command.List>
                    </Command>
                </div>
            )}
        </div>
    )
}
