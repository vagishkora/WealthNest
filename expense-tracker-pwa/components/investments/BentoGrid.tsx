"use client";

import { ReactNode } from "react";

interface BentoGridProps {
    children: ReactNode;
}

export function BentoGrid({ children }: BentoGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)] p-4 max-w-7xl mx-auto">
            {children}
        </div>
    );
}
