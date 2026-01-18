
"use client";

import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    gradient?: boolean;
}

export function GlassCard({ children, className, gradient = false, ...props }: GlassCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={cn(
                "relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-xl",
                gradient && "bg-gradient-to-br from-white/5 to-white/0",
                className
            )}
            suppressHydrationWarning
            {...props}
        >
            {/* Noise Texture Overlay (Optional, adds premium feel) */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" suppressHydrationWarning />

            {/* Content */}
            <div className="relative z-10 h-full" suppressHydrationWarning >
                {children}
            </div >
        </motion.div >
    );
}

export function GradientText({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <span className={cn("bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent", className)}>
            {children}
        </span>
    )
}

// Reusable Sub-components for consistency
export function Card({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-xl", className)} {...props}>
            {children}
        </div>
    )
}

export function CardHeader({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("p-6", className)} {...props}>{children}</div>
}

export function CardTitle({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h3 className={cn("text-lg font-semibold leading-none tracking-tight text-white", className)} {...props}>{children}</h3>
}
