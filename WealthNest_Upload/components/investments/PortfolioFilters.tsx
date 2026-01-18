"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search, TrendingUp, Wallet, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebouncedCallback } from "use-debounce";

export function PortfolioFilters() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const currentType = searchParams.get('type') || 'ALL';
    const currentSearch = searchParams.get('q') || '';

    const handleTypeChange = (type: string) => {
        const params = new URLSearchParams(searchParams);
        if (type === 'ALL') {
            params.delete('type');
        } else {
            params.set('type', type);
        }
        replace(`${pathname}?${params.toString()}`);
    };

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }
        replace(`${pathname}?${params.toString()}`);
    }, 300);

    return (
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
            {/* Type Tabs */}
            <div className="flex p-1 bg-white/5 backdrop-blur-md rounded-full border border-white/5">
                <button
                    onClick={() => handleTypeChange('ALL')}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all",
                        currentType === 'ALL'
                            ? "bg-white text-black shadow-lg"
                            : "text-neutral-400 hover:text-white"
                    )}
                >
                    <LayoutGrid size={14} />
                    ALL
                </button>
                <button
                    onClick={() => handleTypeChange('STOCK')}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all",
                        currentType === 'STOCK'
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                            : "text-neutral-400 hover:text-white"
                    )}
                >
                    <TrendingUp size={14} />
                    STOCKS
                </button>
                <button
                    onClick={() => handleTypeChange('MF')}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all",
                        currentType === 'MF'
                            ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                            : "text-neutral-400 hover:text-white"
                    )}
                >
                    <Wallet size={14} />
                    FUNDS
                </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-white transition-colors" size={16} />
                <input
                    type="text"
                    placeholder="Search assets..."
                    defaultValue={currentSearch}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/20 focus:bg-white/5 transition-all"
                />
            </div>
        </div>
    );
}
