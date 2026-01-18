'use client'

import { deleteInvestment } from "@/app/actions/investments"
import { Trash2 } from "lucide-react"
import { useTransition } from "react"

export function DeleteButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition()

    return (
        <button
            onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                startTransition(async () => {
                    if (confirm('Are you sure you want to delete this investment?')) {
                        await deleteInvestment(id)
                    }
                })
            }}
            disabled={isPending}
            className="p-2 text-neutral-500 hover:text-red-500 transition disabled:opacity-50"
        >
            <Trash2 size={16} />
        </button>
    )
}
