'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown } from "lucide-react"

export function FundSelect({ funds, onSelect }: { funds: any[], onSelect: (fund: any) => void }) {
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("")

    return (
        <div className="relative">
            <label className="block text-sm text-neutral-400 mb-1">Select Fund</label>
            <select
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-3 px-4 text-white appearance-none"
                onChange={(e) => {
                    const fund = funds.find(f => f.id === e.target.value)
                    if (fund) onSelect(fund)
                }}
                defaultValue=""
            >
                <option value="" disabled>Select a fund...</option>
                {funds.map((fund) => (
                    <option key={fund.id} value={fund.id}>
                        {fund.name}
                    </option>
                ))}
            </select>
        </div>
    )
}
