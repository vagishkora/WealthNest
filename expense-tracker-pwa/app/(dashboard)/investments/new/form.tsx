'use client'

import { useState } from 'react'
import { addInvestment } from '@/app/actions/investments'
import { FundCombobox } from '@/components/FundCombobox'
import { StockCombobox } from "@/components/StockCombobox"

export function NewInvestmentForm({ funds, goals, initialData }: { funds: any[], goals?: any[], initialData?: any }) {
    const [type, setType] = useState(initialData?.type || 'SIP')
    const [selectedFundName, setSelectedFundName] = useState(initialData?.name || '')
    const [selectedFundId, setSelectedFundId] = useState<string | null>(initialData?.fundReferenceId || null)
    const [selectedAmfiCode, setSelectedAmfiCode] = useState<string | null>(initialData?.amfiCode || null)
    const [selectedTicker, setSelectedTicker] = useState<string | null>(initialData?.tickerSymbol || null)
    const [price, setPrice] = useState(initialData?.averageBuyPrice?.toString() || '')
    const [fetching, setFetching] = useState(false)
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    async function handleSubmit(formData: FormData) {
        setSubmitting(true)
        if (initialData?.id) {
            // Edit mode server action (need to implement updateInvestment or just reuse add with ID? 
            // Better to have separate update action or handle in add with ID check but add creates new UUID usually.
            // Let's create updateInvestment. For now, assuming addInvestment handles it OR I need to add updateAction logic.
            // Actually, I'll update addInvestment to update if ID is present or create specific update action.
            // Let's assume I will create `updateInvestment` action and call it here.
            const { updateInvestment } = await import('@/app/actions/investments')
            const res = await updateInvestment(initialData.id, formData)
            if (res?.error) {
                setError(res.error)
                setSubmitting(false)
            }
        } else {
            const res = await addInvestment(formData)
            if (res?.error) {
                setError(res.error)
                setSubmitting(false)
            }
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6" suppressHydrationWarning>

            {/* Type Selection */}
            <div className="flex gap-2 p-1 bg-neutral-900 rounded-xl border border-neutral-800" suppressHydrationWarning>
                {['SIP', 'LUMPSUM', 'STOCK', 'FD'].map((t) => (
                    <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        suppressHydrationWarning
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${type === t ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
                            }`}
                    >
                        {t === 'FD' ? 'Fixed Deposit' : t}
                    </button>
                ))}
                <input type="hidden" name="type" value={type} suppressHydrationWarning />
            </div>

            {type === 'STOCK' ? (
                /* Stock Manual Entry Flow (Search Disabled for now) */
                null
            ) : type === 'FD' ? (
                /* No Combobox for FD, just manual input below */
                null
            ) : (
                <FundCombobox
                    onSelect={(fund) => {
                        setSelectedFundName(fund.name)
                        setSelectedAmfiCode(fund.amfiCode || null)
                        setSelectedFundId(null)
                    }}
                />
            )}

            <input type="hidden" name="fundReferenceId" value={selectedFundId || ''} suppressHydrationWarning />
            <input type="hidden" name="name" value={selectedFundName || ''} suppressHydrationWarning />
            <input type="hidden" name="amfiCode" value={selectedAmfiCode || ''} suppressHydrationWarning />

            {/* Ticker Input FIRST for Stocks */}
            {type === 'STOCK' && (
                <div className="mb-6 p-4 bg-neutral-900/50 rounded-xl border border-neutral-800" suppressHydrationWarning>
                    <label className="block text-sm text-blue-400 font-medium mb-1">Step 1: Enter Ticker Symbol</label>
                    <p className="text-xs text-neutral-500 mb-2">
                        Enter the symbol (e.g. <code>TCS</code>, <code>ZOMATO</code>, <code>RELIANCE</code>) and we'll fetch the rest.
                    </p>
                    <div className="relative">
                        <input
                            type="text"
                            name="tickerSymbol"
                            required
                            // Convert to upper case on change
                            value={selectedTicker || ''}
                            onChange={(e) => {
                                const val = e.target.value.toUpperCase();
                                setSelectedTicker(val);
                                // Pre-fill name to avoid "Field required" error if they submit fast
                                if (!selectedFundName || selectedFundName === selectedTicker) {
                                    setSelectedFundName(val);
                                }
                            }}
                            onBlur={async () => {
                                if (selectedTicker && selectedTicker.length > 2) {
                                    setFetching(true);
                                    try {
                                        const { fetchStockDetails } = await import('@/app/actions/investments')
                                        const res = await fetchStockDetails(selectedTicker)
                                        if (res.success && res.data) {
                                            setSelectedFundName(res.data.name)
                                            setSelectedTicker(res.data.ticker)
                                            // Update price state 
                                            setPrice(res.data.price.toString())
                                        }
                                    } catch (e) { console.error(e) }
                                    setFetching(false);
                                }
                            }}
                            placeholder="e.g. ZOMATO"
                            className="w-full bg-black border border-neutral-700 rounded-lg py-3 px-4 text-white font-mono text-lg focus:outline-none focus:border-blue-500 transition-colors uppercase"
                        />
                        {fetching && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {type !== 'STOCK' && (
                <input type="hidden" name="tickerSymbol" value={selectedTicker || ''} suppressHydrationWarning />
            )}

            <div suppressHydrationWarning>
                <label className="block text-sm text-neutral-400 mb-1">
                    {type === 'STOCK' ? 'Stock Name (Auto-filled)' : type === 'FD' ? 'Bank / Institution Name' : 'Fund Name'}
                </label>
                <input
                    type="text"
                    name="name"
                    required
                    placeholder={type === 'STOCK' ? "e.g. Reliance Industries" : type === 'FD' ? "e.g. HDFC Bank FD" : "e.g. HDFC Index Fund"}
                    value={selectedFundName} // Controlled input
                    onChange={(e) => setSelectedFundName(e.target.value)}
                    suppressHydrationWarning
                    className={`w-full bg-neutral-950 border border-neutral-800 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-neutral-600 ${type === 'STOCK' ? 'text-neutral-300' : ''}`}
                />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4" suppressHydrationWarning>
                {type === 'STOCK' ? (
                    <>
                        <div suppressHydrationWarning>
                            <label className="block text-sm text-neutral-400 mb-1">Quantity</label>
                            <input
                                type="number"
                                step="any"
                                name="quantity"
                                required
                                defaultValue={initialData?.quantity}
                                suppressHydrationWarning
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-neutral-600"
                            />
                        </div>
                        <div suppressHydrationWarning>
                            <label className="block text-sm text-neutral-400 mb-1">Avg Price</label>
                            <input
                                type="number"
                                step="0.01"
                                name="averageBuyPrice"
                                required
                                value={price} // Controlled
                                onChange={(e) => setPrice(e.target.value)}
                                suppressHydrationWarning
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-neutral-600"
                            />
                        </div>
                        <input type="hidden" name="amount" value="0" suppressHydrationWarning />
                    </>
                ) : type === 'FD' ? (
                    <>
                        <div className="col-span-2" suppressHydrationWarning>
                            <label className="block text-sm text-neutral-400 mb-1">Principal Amount</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">₹</span>
                                <input
                                    type="number"
                                    step="any"
                                    name="amount"
                                    required
                                    defaultValue={initialData?.amount}
                                    suppressHydrationWarning
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-3 pl-8 pr-4 text-white focus:outline-none focus:border-neutral-600"
                                />
                            </div>
                        </div>

                        <div suppressHydrationWarning>
                            <label className="block text-sm text-neutral-400 mb-1">Interest Rate (%)</label>
                            <input
                                type="number"
                                step="any"
                                name="interestRate"
                                required
                                defaultValue={initialData?.interestRate}
                                placeholder="e.g. 7.5"
                                suppressHydrationWarning
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-neutral-600"
                            />
                        </div>

                        <div suppressHydrationWarning>
                            <label className="block text-sm text-neutral-400 mb-1">Maturity Date</label>
                            <input
                                type="date"
                                name="maturityDate"
                                required
                                defaultValue={initialData?.maturityDate ? new Date(initialData.maturityDate).toISOString().split('T')[0] : ''}
                                suppressHydrationWarning
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-neutral-600 scheme-dark"
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="col-span-2" suppressHydrationWarning>
                            <label className="block text-sm text-neutral-400 mb-1">
                                {type === 'SIP' ? 'Monthly Amount' : 'Investment Amount'}
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">₹</span>
                                <input
                                    type="number"
                                    step="any"
                                    name="amount"
                                    required
                                    defaultValue={initialData?.amount}
                                    suppressHydrationWarning
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-3 pl-8 pr-4 text-white focus:outline-none focus:border-neutral-600"
                                />
                            </div>
                        </div>
                        <div className="col-span-2" suppressHydrationWarning>
                            <label className="block text-sm text-neutral-400 mb-1">
                                Current Units Held (Optional)
                            </label>
                            <p className="text-[10px] text-neutral-500 mb-2">
                                Leave blank to automatically calculate units based on historical NAVs.
                            </p>
                            <input
                                type="number"
                                step="any"
                                name="currentUnits"
                                defaultValue={initialData?.currentUnits}
                                suppressHydrationWarning
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-neutral-600 placeholder-neutral-700"
                                placeholder="Auto-calculated if empty"
                            />
                        </div>

                        {type === 'SIP' && (
                            <div className="col-span-2" suppressHydrationWarning>
                                <label className="block text-sm text-neutral-400 mb-1">
                                    Annual Step Up % (Optional)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="stepUpPercentage"
                                    defaultValue={initialData?.stepUpPercentage}
                                    placeholder="e.g. 10"
                                    suppressHydrationWarning
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-neutral-600 placeholder-neutral-700"
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            <div suppressHydrationWarning>
                <label className="block text-sm text-neutral-400 mb-1">Start Date</label>
                <input
                    type="date"
                    name="startDate"
                    required
                    defaultValue={initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                    suppressHydrationWarning
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-neutral-600 scheme-dark"
                />
            </div>

            {/* Goal Linking */}
            {goals && goals.length > 0 && (
                <div suppressHydrationWarning>
                    <label className="block text-sm text-neutral-400 mb-1">Link to Goal (Optional)</label>
                    <select
                        name="goalId"
                        defaultValue={initialData?.goalId || ''}
                        suppressHydrationWarning
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-neutral-600 appearance-none"
                    >
                        <option value="">None</option>
                        {goals.map((g: any) => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
                type="submit"
                disabled={submitting || fetching}
                suppressHydrationWarning
                className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-neutral-200 transition disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
            >
                {submitting || fetching ? (
                    <span className="flex items-center gap-2">
                        <span className="animate-spin h-4 w-4 border-2 border-neutral-400 border-t-black rounded-full"></span>
                        {fetching ? 'Fetching Details...' : 'Saving...'}
                    </span>
                ) : (
                    'Save Investment'
                )}
            </button>
        </form>
    )
}
