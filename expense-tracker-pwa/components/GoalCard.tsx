"use client"

import { GlassCard } from "@/components/ui/GlassCard"
import { motion } from "framer-motion"
import { formatCurrency } from "@/lib/utils"
import { Target, Calendar, Trash2, Edit2 } from "lucide-react"
import { deleteGoal } from "@/app/actions/goals"
import { useState } from "react"
import Link from "next/link"

interface GoalProps {
    id: string
    name: string
    targetAmount: number
    currentAmount: number
    deadline: Date | null
}

export function GoalCard({ goal }: { goal: GoalProps }) {
    const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (confirm("Delete this goal?")) {
            setIsDeleting(true)
            await deleteGoal(goal.id)
        }
    }

    const daysLeft = goal.deadline
        ? Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : null

    if (isDeleting) return null

    return (
        <GlassCard className="p-6 relative group">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Target size={20} />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold text-lg">{goal.name}</h3>
                        {daysLeft !== null && (
                            <p className="text-xs text-neutral-400 flex items-center gap-1">
                                <Calendar size={12} />
                                {daysLeft > 0 ? `${daysLeft} days left` : "Deadline passed"}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex gap-2 opacity-100 transition-opacity">
                    <Link href={`/goals/edit/${goal.id}`} className="p-3 text-neutral-400 hover:text-white bg-white/5 rounded-full">
                        <Edit2 size={18} />
                    </Link>
                    <button onClick={handleDelete} className="p-3 text-neutral-400 hover:text-red-500 hover:bg-rose-500/10 rounded-full">
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            <div className="mb-2 flex justify-between text-sm">
                <span className="text-neutral-400">Progress</span>
                <span className="text-emerald-400 font-mono">{progress.toFixed(1)}%</span>
            </div>

            <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden mb-4">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full"
                />
            </div>

            <div className="flex justify-between items-end">
                <div>
                    <p className="text-xs text-neutral-500">Saved</p>
                    <p className="text-white font-semibold font-mono">{formatCurrency(goal.currentAmount)}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-neutral-500">Target</p>
                    <p className="text-neutral-300 font-medium font-mono">{formatCurrency(goal.targetAmount)}</p>
                </div>
            </div>
        </GlassCard>
    )
}
