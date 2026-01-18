'use client'

import { createGoal, updateGoal } from "@/app/actions/goals"
import { GlassCard, GradientText } from "@/components/ui/GlassCard"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function NewGoalForm({ initialData }: { initialData?: any }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError("")

        let res
        if (initialData?.id) {
            res = await updateGoal(initialData.id, formData)
        } else {
            res = await createGoal(formData)
        }

        if (res?.error) {
            setError(res.error)
            setLoading(false)
        } else {
            router.push('/goals')
        }
    }

    return (
        <div className="w-full max-w-md">
            <Link href="/goals" className="inline-flex items-center text-neutral-400 hover:text-white mb-6 transition">
                <ArrowLeft className="mr-2" size={20} />
                Back to Goals
            </Link>

            <h1 className="text-3xl font-bold mb-2">
                <GradientText>{initialData ? 'Edit Goal' : 'New Goal'}</GradientText>
            </h1>
            <p className="text-neutral-500 text-sm mb-8">{initialData ? 'Update your target' : 'What are we saving for?'}</p>

            <GlassCard className="p-8">
                <form action={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm text-neutral-400 mb-2">Goal Name</label>
                        <input
                            name="name"
                            type="text"
                            placeholder="e.g. Dream Vacation"
                            required
                            defaultValue={initialData?.name}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-neutral-600 placeholder:text-neutral-700"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-neutral-400 mb-2">Target (₹)</label>
                            <input
                                name="targetAmount"
                                type="number"
                                step="1000"
                                placeholder="1,00,000"
                                required
                                defaultValue={initialData?.targetAmount}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-neutral-600 placeholder:text-neutral-700"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-neutral-400 mb-2">Manual Savings (₹)</label>
                            <input
                                name="currentAmount"
                                type="number"
                                step="1000"
                                placeholder="0"
                                defaultValue={initialData?.currentAmount}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-neutral-600 placeholder:text-neutral-700"
                            />
                            {initialData?.automatedAmount > 0 && (
                                <p className="text-[10px] text-emerald-500 mt-1">
                                    + {initialData.automatedAmount.toLocaleString()} from investments
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-neutral-400 mb-2">Target Date (Optional)</label>
                        <input
                            name="deadline"
                            type="date"
                            defaultValue={initialData?.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : ''}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-neutral-600 [color-scheme:dark]"
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-neutral-200 transition disabled:opacity-50 flex items-center justify-center"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (initialData ? "Update Goal" : "Create Goal")}
                    </button>
                </form>
            </GlassCard>
        </div>
    )
}
