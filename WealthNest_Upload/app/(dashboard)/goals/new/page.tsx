'use client'
import { NewGoalForm } from '../edit/[id]/form'

export default function NewGoalPage() {
    return (
        <div className="p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black min-h-screen text-white flex flex-col items-center justify-center">
            <NewGoalForm />
        </div>
    )
}
