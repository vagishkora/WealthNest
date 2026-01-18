
"use client";

import { useState } from "react";
import { GlassCard, GradientText } from "@/components/ui/GlassCard";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { processCasUpload, saveImportedData } from "@/app/actions/import";
import { formatCurrency } from "@/lib/utils";

export default function ImportPage() {
    const [file, setFile] = useState<File | null>(null);
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [stage, setStage] = useState<'UPLOAD' | 'REVIEW' | 'SUCCESS'>('UPLOAD');
    const [extractedData, setExtractedData] = useState<any[]>([]);
    const [error, setError] = useState("");
    const [importCount, setImportCount] = useState(0);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError("");
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        setError("");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("password", password);

        const res = await processCasUpload(formData);

        if (res.error) {
            setError(res.error);
            setLoading(false);
        } else {
            setExtractedData(res.data || []);
            setStage("REVIEW");
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        setLoading(true);
        setError("");

        try {
            const res = await saveImportedData(extractedData);
            if (res.error) {
                setError(res.error);
                setLoading(false);
            } else {
                setImportCount(res.count || 0);
                setStage("SUCCESS");
                setLoading(false);
            }
        } catch (err) {
            setError("An unexpected error occurred.");
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black min-h-screen pb-32 text-white">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">
                    <GradientText>Import Portfolio</GradientText>
                </h1>
                <p className="text-neutral-500 text-sm mt-1">
                    Upload your CAS (Consolidated Account Statement) PDF to auto-import your investments.
                </p>
            </header>

            {stage === 'UPLOAD' && (
                <GlassCard className="p-8 max-w-xl mx-auto">
                    <form onSubmit={handleUpload} className="space-y-6">
                        <div className="border-2 border-dashed border-neutral-700 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-neutral-500 transition hover:bg-white/5 relative">
                            <input
                                type="file"
                                accept=".pdf,.xlsx,.xls,.csv"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                required
                            />
                            <Upload className="h-10 w-10 text-neutral-500 mb-4" />
                            <p className="text-sm font-medium text-white mb-1">
                                {file ? file.name : "Click to upload CAS PDF or Excel/CSV"}
                            </p>
                            <p className="text-xs text-neutral-500">Supported: CAMS CAS (PDF), Excel, CSV</p>
                        </div>

                        <div>
                            <label className="block text-sm text-neutral-400 mb-2">PDF Password (if any)</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="e.g. PAN Number"
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-neutral-600"
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-500 text-sm">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !file}
                            className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-neutral-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "Process Statement"}
                        </button>
                    </form>
                </GlassCard>
            )}

            {stage === 'REVIEW' && (
                <div className="space-y-6 max-w-3xl mx-auto">
                    <GlassCard className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Review Data</h2>
                            <span className="text-sm text-neutral-500">{extractedData.length} Schemes Found</span>
                        </div>

                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            {extractedData.map((scheme, idx) => (
                                <div key={idx} className="bg-neutral-900/50 p-4 rounded-xl border border-white/5">
                                    <h3 className="font-semibold text-white mb-2">{scheme.name}</h3>
                                    <p className="text-xs text-neutral-500 mb-3">Folio: {scheme.folio || 'N/A'}</p>

                                    <div className="space-y-2">
                                        {scheme.transactions.slice(0, 3).map((txn: any, tIdx: number) => (
                                            <div key={tIdx} className="flex justify-between text-xs text-neutral-300 border-b border-white/5 pb-1 last:border-0">
                                                <span>{new Date(txn.date).toLocaleDateString()}</span>
                                                <span>{txn.type}</span>
                                                <span>{formatCurrency(txn.amount)}</span>
                                            </div>
                                        ))}
                                        {scheme.transactions.length > 3 && (
                                            <p className="text-[10px] text-neutral-500 text-center italic">
                                                + {scheme.transactions.length - 3} more transactions
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex gap-4">
                            <button onClick={() => setStage('UPLOAD')} className="flex-1 py-3 bg-neutral-800 text-white rounded-xl hover:bg-neutral-700 transition font-medium">
                                Cancel
                            </button>
                            <button onClick={handleConfirm} disabled={loading} className="flex-1 py-3 bg-white text-black rounded-xl hover:bg-neutral-200 transition font-bold flex items-center justify-center gap-2">
                                {loading ? <Loader2 className="animate-spin" /> : "Confirm Import"}
                            </button>
                        </div>
                    </GlassCard>
                </div>
            )}

            {stage === 'SUCCESS' && (
                <GlassCard className="p-12 max-w-md mx-auto text-center flex flex-col items-center">
                    <div className="h-16 w-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Import Successful!</h2>
                    <p className="text-neutral-500 text-sm mb-8">
                        Your investment logic has been updated. Background sync will now fetch current NAVs for these schemes.
                    </p>
                    <button onClick={() => window.location.href = '/investments'} className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-neutral-200 transition">
                        Go to Dashboard
                    </button>
                </GlassCard>
            )}
        </div>
    );
}
