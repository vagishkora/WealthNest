"use client";

import { useState, useOptimistic } from "react";
import { addIncome, addExpense, deleteTransaction, editIncome, editExpense } from "@/app/actions/tracker";
import { Plus, Trash2, Tag, Calendar, Wallet, ShoppingBag, Banknote, CreditCard, Pencil } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { INCOME_CATEGORIES as INCOMES, EXPENSE_CATEGORIES as EXPENSES } from "@/lib/tracker-constants";


interface Transaction {
    id: string;
    amount: number;
    category: string;
    paymentMode: string;
    date: Date;
    note?: string | null;
    source?: string;   // Income only
    shopName?: string; // Expense only
}

interface TransactionTableProps {
    type: 'INCOME' | 'EXPENSE';
    data: Transaction[];
}

const PAYMENT_MODES = ["CASH", "ONLINE"];

export function TransactionTable({ type, data }: TransactionTableProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form States
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [paymentMode, setPaymentMode] = useState("ONLINE");
    const [note, setNote] = useState("");
    const [source, setSource] = useState("");     // Income
    const [shopName, setShopName] = useState(""); // Expense

    // Datalist ID
    const datalistId = `categories-${type}`;
    const categories = type === 'INCOME' ? INCOMES : EXPENSES;

    // Optimistic UI
    const [optimisticData, setOptimisticData] = useOptimistic(
        data,
        (state, { action, payload }: { action: 'add' | 'edit' | 'delete', payload: any }) => {
            if (action === 'add') return [payload, ...state].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            if (action === 'edit') return state.map(t => t.id === payload.id ? payload : t);
            if (action === 'delete') return state.filter(t => t.id !== payload);
            return state;
        }
    );

    function handleEdit(item: Transaction) {
        setEditingId(item.id);
        const dateStr = new Date(item.date).toISOString().split('T')[0];
        setDate(dateStr);
        setAmount(item.amount.toString());
        setCategory(item.category);
        setPaymentMode(item.paymentMode);
        setNote(item.note || "");
        if (type === 'INCOME') {
            setSource(item.source || "");
        } else {
            setShopName(item.shopName || "");
        }
        setIsAdding(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true); // Keep loading for button state, but UI will update instantly

        const dateObj = new Date(date + 'T12:00:00');
        const newItem: Transaction = {
            id: editingId || Math.random().toString(), // Temp ID for new items
            amount: parseFloat(amount),
            category,
            paymentMode,
            date: dateObj,
            note,
            source: type === 'INCOME' ? source : undefined,
            shopName: type === 'EXPENSE' ? shopName : undefined,
        };

        // Optimistic Update
        setOptimisticData({ action: editingId ? 'edit' : 'add', payload: newItem });

        // Reset Form immediately for better UX
        if (!editingId) {
            setAmount("");
            setNote("");
            setSource("");
            setShopName("");
            // Keep date, category, mode for rapid entry
        }
        setIsAdding(false);
        setEditingId(null);

        try {
            if (type === 'INCOME') {
                if (editingId) {
                    await editIncome(editingId, newItem);
                } else {
                    await addIncome(newItem);
                }
            } else {
                if (editingId) {
                    await editExpense(editingId, newItem);
                } else {
                    await addExpense(newItem);
                }
            }
        } catch (error) {
            console.error(error);
            alert("Failed to save. Please refresh.");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure?")) return;
        setOptimisticData({ action: 'delete', payload: id });
        try {
            await deleteTransaction(type, id);
        } catch (error) {
            console.error(error);
            alert("Failed to delete.");
        }
    }

    return (
        <div className="w-full h-full flex flex-col" suppressHydrationWarning>
            <div className="flex justify-between items-center mb-6 flex-shrink-0" suppressHydrationWarning>
                <div className="flex items-center gap-2" suppressHydrationWarning>
                    <span className={cn("text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider", type === 'INCOME' ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400")} suppressHydrationWarning>
                        {type}
                    </span>
                    <span className="text-xs text-neutral-500" suppressHydrationWarning>{optimisticData.length} records</span>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className={cn(
                        "flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full transition-all shadow-lg backdrop-blur-md active:scale-95",
                        type === 'INCOME'
                            ? "bg-emerald-500 text-black hover:bg-emerald-400"
                            : "bg-rose-500 text-white hover:bg-rose-600"
                    )}
                    suppressHydrationWarning
                >
                    <Plus size={14} /> Add New
                </button>
            </div>

            {/* Input Form */}
            {isAdding && (
                <form onSubmit={handleSubmit} className="mb-6 bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 animate-in fade-in slide-in-from-top-4 shadow-2xl relative overflow-hidden group" suppressHydrationWarning>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" suppressHydrationWarning />

                    <div className="grid grid-cols-2 md:grid-cols-12 gap-4 relative z-10" suppressHydrationWarning>
                        {/* Date */}
                        <div className="col-span-1 md:col-span-2">
                            <label className="text-[10px] uppercase text-neutral-400 font-bold mb-1.5 block pl-1">Date</label>
                            <input
                                type="date"
                                required
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition"
                            />
                        </div>

                        {/* Amount */}
                        <div className="col-span-1 md:col-span-2">
                            <label className="text-[10px] uppercase text-neutral-400 font-bold mb-1.5 block pl-1">Amount</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-neutral-500 text-sm">₹</span>
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-7 pr-3 py-3 text-sm text-white font-mono font-bold focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition placeholder:text-neutral-700"
                                />
                            </div>
                        </div>

                        {/* Vendor / Source */}
                        <div className="col-span-2 md:col-span-3">
                            <label className="text-[10px] uppercase text-neutral-400 font-bold mb-1.5 block pl-1">{type === 'INCOME' ? 'Payer' : 'Vendor'}</label>
                            {type === 'INCOME' ? (
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Upwork"
                                    value={source}
                                    onChange={(e) => setSource(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition placeholder:text-neutral-600"
                                />
                            ) : (
                                <input
                                    type="text"
                                    placeholder="e.g. Starbucks"
                                    value={shopName}
                                    onChange={(e) => setShopName(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition placeholder:text-neutral-600"
                                />
                            )}
                        </div>

                        {/* Category */}
                        <div className="col-span-1 md:col-span-2 relative">
                            <label className="text-[10px] uppercase text-neutral-400 font-bold mb-1.5 block pl-1">Category</label>
                            <input
                                list={datalistId}
                                type="text"
                                required
                                placeholder="Select..."
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition placeholder:text-neutral-600"
                            />
                            <datalist id={datalistId}>
                                {categories.map(cat => (
                                    <option key={cat} value={cat} />
                                ))}
                            </datalist>
                        </div>


                        {/* Mode */}
                        <div className="col-span-1 md:col-span-3">
                            <label className="text-[10px] uppercase text-neutral-400 font-bold mb-1.5 block pl-1">Mode</label>
                            <div className="relative">
                                <div className="absolute left-3 top-3 pointer-events-none text-neutral-500">
                                    {paymentMode === 'CASH' ? <Banknote size={16} /> : <CreditCard size={16} />}
                                </div>
                                <select
                                    value={paymentMode}
                                    onChange={(e) => setPaymentMode(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-3 py-3 text-sm text-white appearance-none focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition cursor-pointer"
                                >
                                    {PAYMENT_MODES.map(mode => (
                                        <option key={mode} value={mode}>{mode}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Note - Full Width */}
                        <div className="col-span-2 md:col-span-12">
                            <label className="text-[10px] uppercase text-neutral-400 font-bold mb-1.5 block pl-1">Note</label>
                            <input
                                type="text"
                                placeholder="Optional description..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition placeholder:text-neutral-600"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="col-span-2 md:col-span-12">
                            <button
                                type="submit"
                                disabled={loading}
                                className={cn(
                                    "text-white rounded-xl px-4 py-3 text-sm font-bold w-full disabled:opacity-50 shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2",
                                    type === 'INCOME' ? "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:brightness-110" : "bg-gradient-to-r from-rose-600 to-rose-500 hover:brightness-110"
                                )}
                            >
                                {editingId ? <Pencil size={18} /> : <Plus size={18} />}
                                {editingId ? "Update Entry" : "Save Entry"}
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* Data Table */}
            <div className="w-full transition-colors" suppressHydrationWarning>
                <div className="w-full overflow-x-auto pb-10" suppressHydrationWarning>
                    <div className="grid grid-cols-12 text-[10px] uppercase tracking-widest text-neutral-500 px-4 pb-3 border-b border-white/5 font-bold sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-md z-10 pt-2" suppressHydrationWarning>
                        <div className="col-span-2 pl-2" suppressHydrationWarning>Date</div>
                        <div className="col-span-4" suppressHydrationWarning>Details</div>
                        <div className="col-span-2" suppressHydrationWarning>Mode</div>
                        <div className="col-span-3 text-right pr-2" suppressHydrationWarning>Amount</div>
                        <div className="col-span-1" suppressHydrationWarning></div>
                    </div>

                    {optimisticData.length === 0 ? (
                        <div className="text-center py-20 flex flex-col items-center justify-center opacity-40 hover:opacity-100 transition-opacity duration-500" suppressHydrationWarning>
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4" suppressHydrationWarning>
                                <Tag size={24} className="text-neutral-500" />
                            </div>
                            <p className="text-neutral-500 font-medium" suppressHydrationWarning>No {type.toLowerCase()} found.</p>
                            <p className="text-[10px] text-neutral-600 mt-1" suppressHydrationWarning>Add a new entry to get started.</p>
                        </div>
                    ) : (
                        <div className="space-y-1 mt-2" suppressHydrationWarning>
                            {optimisticData.map((item, i) => (
                                <div
                                    key={item.id}
                                    className="grid grid-cols-12 items-center px-2 py-3 rounded-xl hover:bg-white/5 transition duration-200 group border border-transparent hover:border-white/5 relative overflow-hidden"
                                    suppressHydrationWarning
                                    style={{ animationDelay: `${i * 50}ms` }}
                                >
                                    <div className="col-span-2 text-neutral-400 font-mono font-medium pl-2" suppressHydrationWarning>
                                        <div className="flex flex-col" suppressHydrationWarning>
                                            <span className="text-white text-xs font-bold" suppressHydrationWarning>{new Date(item.date).getDate()}</span>
                                            <span className="text-[9px] uppercase tracking-wider text-neutral-500" suppressHydrationWarning>{new Date(item.date).toLocaleString('default', { month: 'short' })}</span>
                                        </div>
                                    </div>
                                    <div className="col-span-4 text-white truncate pr-4" suppressHydrationWarning>
                                        <div className="font-bold text-sm tracking-tight text-neutral-200 group-hover:text-white transition-colors" suppressHydrationWarning>
                                            {type === 'INCOME' ? item.source : item.shopName || 'Unknown'}
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5" suppressHydrationWarning>
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/5 text-neutral-400 border border-white/5" suppressHydrationWarning>
                                                {item.category}
                                            </span>
                                            {item.note && <span className="text-[10px] text-neutral-600 truncate max-w-[100px]" suppressHydrationWarning>{item.note}</span>}
                                        </div>
                                    </div>
                                    <div className="col-span-2" suppressHydrationWarning>
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border opacity-70 group-hover:opacity-100 transition-opacity",
                                            item.paymentMode === 'CASH'
                                                ? "bg-amber-500/10 text-amber-500 border-amber-500/10"
                                                : "bg-indigo-500/10 text-indigo-400 border-indigo-500/10"
                                        )} suppressHydrationWarning>
                                            {item.paymentMode === 'CASH' ? <Banknote size={10} /> : <CreditCard size={10} />}
                                            {item.paymentMode}
                                        </span>
                                    </div>
                                    <div className={cn("col-span-3 text-right font-mono font-bold text-sm tracking-tight pr-2",
                                        type === 'INCOME' ? "text-emerald-400" : "text-rose-400"
                                    )} suppressHydrationWarning>
                                        {type === 'INCOME' ? '+' : '-'}{formatCurrency(item.amount)}
                                    </div>
                                    <div className="col-span-1 flex justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity" suppressHydrationWarning>
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="text-neutral-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
                                            suppressHydrationWarning
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-neutral-400 hover:text-rose-500 p-1 rounded-full hover:bg-rose-500/10 transition"
                                            suppressHydrationWarning
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}
