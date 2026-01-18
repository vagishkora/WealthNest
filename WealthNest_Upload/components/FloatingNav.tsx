
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Wallet, Target, User, NotebookPen, PieChart, Cog } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function FloatingNav() {
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50" suppressHydrationWarning>
            <nav className="flex items-center gap-2 p-2 rounded-full border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl shadow-black/50" suppressHydrationWarning>
                <NavItem href="/dashboard" icon={LayoutDashboard} label="Home" />
                <NavItem href="/analytics" icon={PieChart} label="Analytics" />
                <NavItem href="/investments" icon={Wallet} label="Invest" />
                <NavItem href="/tracker" icon={NotebookPen} label="Tracker" />
                <NavItem href="/goals" icon={Target} label="Goals" />
                <NavItem href="/profile" icon={User} label="Profile" />
                <NavItem href="/settings" icon={Cog} label="Settings" />
            </nav>
        </div>
    )
}

function NavItem({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
    const pathname = usePathname()
    const isActive = pathname === href

    return (
        <Link href={href} className="relative group">
            <div className={cn(
                "p-3 rounded-full transition-all duration-300 relative z-10",
                isActive ? "text-white" : "text-neutral-400 hover:text-white"
            )} suppressHydrationWarning>
                <Icon size={24} />
                <span className="sr-only">{label}</span>
            </div>

            {isActive && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white/10 rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    suppressHydrationWarning={true}
                />
            )}
        </Link>
    )
}
