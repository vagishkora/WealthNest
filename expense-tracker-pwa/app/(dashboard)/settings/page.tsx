"use client"

import { useState, useEffect } from "react"
import { useAppLock } from "@/context/AppLockContext"
import { GlassCard, GradientText, CardHeader, CardTitle } from "@/components/ui/GlassCard"
import { motion } from "framer-motion"
import { Shield, Lock, Download, Cloud, CheckCircle, Wifi, WifiOff, FileJson, FileSpreadsheet, FileText } from "lucide-react"
import { getExportData } from "@/app/actions/data"
import { cn } from "@/lib/utils"
import { downloadCSV, flattenAllData } from "@/lib/export/generate-csv"
import { generatePDF } from "@/lib/export/generate-pdf"

import { useSession } from "next-auth/react"
import { sendOtp, updateUserPin, resetPinWithOtp } from "@/app/actions/auth"

import { PushManager } from "@/components/PushManager"

export default function SettingsPage() {
    const { data: session } = useSession()
    const { isSetup, setupLock, removeLock, isBiometricEnabled, isBiometricSupported, enableBiometric, disableBiometric } = useAppLock()

    // State
    const [pin, setPin] = useState("")
    const [confirmPin, setConfirmPin] = useState("")
    const [otp, setOtp] = useState("")

    const [isExporting, setIsExporting] = useState(false)
    const [isOnline, setIsOnline] = useState(true)

    const [isEditingPin, setIsEditingPin] = useState(false)
    const [isForgotPinMode, setIsForgotPinMode] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)

    // Online Status
    useEffect(() => {
        setIsOnline(navigator.onLine)
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)
        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)
        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    const handleLockToggle = (checked: boolean) => {
        if (!checked) {
            removeLock()
        }
    }

    const handleSetPin = async () => {
        if (pin.length === 4 && pin === confirmPin) {
            setIsProcessing(true)
            // Sync to server if logged in
            if (session?.user?.email) {
                await updateUserPin(session.user.email, pin)
            }
            setupLock(pin)
            setPin("")
            setConfirmPin("")
            setIsProcessing(false)
        }
    }

    const handleChangePinSubmit = async () => {
        if (pin.length === 4 && pin === confirmPin && session?.user?.email) {
            setIsProcessing(true)
            await updateUserPin(session.user.email, pin)
            setupLock(pin)
            setIsEditingPin(false)
            setPin("")
            setConfirmPin("")
            setIsProcessing(false)
            alert("PIN Updated Successfully!")
        }
    }

    const handleIntiateForgotPin = async () => {
        if (session?.user?.email) {
            setIsProcessing(true)
            const res = await sendOtp(session.user.email)
            if (res.success) {
                setIsForgotPinMode(true)
                setPin("")
                setConfirmPin("")
            } else {
                alert(res.error || "Failed to send OTP")
            }
            setIsProcessing(false)
        }
    }

    const handleResetPinSubmit = async () => {
        if (otp.length === 6 && pin.length === 4 && pin === confirmPin && session?.user?.email) {
            setIsProcessing(true)
            const res = await resetPinWithOtp(session.user.email, otp, pin)
            if (res.success) {
                setupLock(pin)
                setIsForgotPinMode(false)
                setOtp("")
                setPin("")
                setConfirmPin("")
                alert("PIN Reset Successfully!")
            } else {
                alert(res.error || "Failed to reset PIN")
            }
            setIsProcessing(false)
        }
    }

    const handleExport = async (format: 'json' | 'csv' | 'pdf') => {
        setIsExporting(true)
        try {
            const data = await getExportData()

            if (format === 'json') {
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = `wealthnest-backup-${new Date().toISOString().split('T')[0]}.json`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
            }
            else if (format === 'csv') {
                // Master Dump CSV
                const allData = flattenAllData(data.data)
                downloadCSV(allData, `wealthnest-data-dump-${new Date().toISOString().split('T')[0]}.csv`)
            }
            else if (format === 'pdf') {
                generatePDF(data.data)
            }

        } catch (error) {
            console.error("Export failed", error)
            alert("Export failed. Please try again.")
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <div className="p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black min-h-screen pb-32 text-white flex flex-col items-center" suppressHydrationWarning>
            <header className="mb-8 text-center">
                <h1 className="text-3xl font-bold">
                    <GradientText>Settings</GradientText>
                </h1>
                <p className="text-neutral-500 text-sm mt-1">Manage security and data</p>
            </header>

            <div className="grid gap-6 max-w-2xl w-full">
                {/* Security Section */}
                <GlassCard className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <Shield size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">App Security</h2>
                            <p className="text-sm text-neutral-400">Protect your financial data</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Lock size={16} className="text-neutral-400" />
                                <span>App Lock (PIN)</span>
                            </div>
                            <Switch checked={isSetup} onCheckedChange={(c) => c ? null : handleLockToggle(false)} disabled={!isSetup} />
                        </div>

                        {/* PIN Setup / Management */}
                        {!isSetup && !isForgotPinMode ? (
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-4">
                                <p className="text-sm text-neutral-300">Set a 4-digit PIN to secure the app.</p>
                                <div className="flex gap-4">
                                    <input
                                        type="password"
                                        placeholder="PIN"
                                        maxLength={4}
                                        value={pin}
                                        onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                                        className="bg-neutral-900 border border-white/20 rounded-lg px-4 py-2 w-24 text-center tracking-widest outline-none focus:border-emerald-500"
                                    />
                                    <input
                                        type="password"
                                        placeholder="Confirm"
                                        maxLength={4}
                                        value={confirmPin}
                                        onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
                                        className="bg-neutral-900 border border-white/20 rounded-lg px-4 py-2 w-24 text-center tracking-widest outline-none focus:border-emerald-500"
                                    />
                                    <button
                                        onClick={handleSetPin}
                                        disabled={pin.length !== 4 || pin !== confirmPin || isProcessing}
                                        className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-bold px-4 py-2 rounded-lg transition-colors"
                                    >
                                        {isProcessing ? "Saving..." : "Set PIN"}
                                    </button>
                                </div>
                            </div>
                        ) : null}

                        {isSetup && !isEditingPin && !isForgotPinMode && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl space-y-3">
                                <div className="flex items-center gap-3">
                                    <CheckCircle size={18} className="text-emerald-500" />
                                    <span className="text-sm text-emerald-200">App Lock is active.</span>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setIsEditingPin(true)}
                                        className="text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        Change PIN
                                    </button>
                                    <button
                                        onClick={handleIntiateForgotPin}
                                        className="text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        Forgot PIN?
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Change PIN Mode */}
                        {isEditingPin && (
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-4">
                                <p className="text-sm font-bold text-white">Change PIN</p>
                                <div className="flex flex-col gap-3">
                                    <div className="flex gap-4">
                                        <input
                                            type="password"
                                            placeholder="New PIN"
                                            maxLength={4}
                                            value={pin}
                                            onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                                            className="bg-neutral-900 border border-white/20 rounded-lg px-4 py-2 w-full text-center tracking-widest outline-none focus:border-emerald-500"
                                        />
                                        <input
                                            type="password"
                                            placeholder="Confirm"
                                            maxLength={4}
                                            value={confirmPin}
                                            onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
                                            className="bg-neutral-900 border border-white/20 rounded-lg px-4 py-2 w-full text-center tracking-widest outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleChangePinSubmit}
                                            disabled={pin.length !== 4 || pin !== confirmPin || isProcessing}
                                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-bold px-4 py-2 rounded-lg transition-colors"
                                        >
                                            {isProcessing ? "Updating..." : "Update PIN"}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditingPin(false);
                                                setPin("");
                                                setConfirmPin("");
                                            }}
                                            className="px-4 py-2 rounded-lg hover:bg-white/10 text-neutral-400"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Forgot PIN Mode */}
                        {isForgotPinMode && (
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-4">
                                <p className="text-sm font-bold text-white">Reset PIN via Email</p>
                                <p className="text-xs text-neutral-400">An OTP has been sent to {session?.user?.email}</p>

                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Enter 6-digit OTP"
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                        className="w-full bg-neutral-900 border border-white/20 rounded-lg px-4 py-2 text-center tracking-widest outline-none focus:border-emerald-500"
                                    />

                                    <div className="flex gap-4">
                                        <input
                                            type="password"
                                            placeholder="New PIN"
                                            maxLength={4}
                                            value={pin}
                                            onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                                            className="bg-neutral-900 border border-white/20 rounded-lg px-4 py-2 w-full text-center tracking-widest outline-none focus:border-emerald-500"
                                        />
                                        <input
                                            type="password"
                                            placeholder="Confirm"
                                            maxLength={4}
                                            value={confirmPin}
                                            onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
                                            className="bg-neutral-900 border border-white/20 rounded-lg px-4 py-2 w-full text-center tracking-widest outline-none focus:border-emerald-500"
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleResetPinSubmit}
                                            disabled={otp.length !== 6 || pin.length !== 4 || pin !== confirmPin || isProcessing}
                                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-bold px-4 py-2 rounded-lg transition-colors"
                                        >
                                            {isProcessing ? "Verifying..." : "Verify & Reset"}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsForgotPinMode(false);
                                                setOtp("");
                                                setPin("");
                                                setConfirmPin("");
                                            }}
                                            className="px-4 py-2 rounded-lg hover:bg-white/10 text-neutral-400"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}


                        {/* Biometric Toggle */}
                        {isSetup && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full border-2 border-neutral-400 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-neutral-400" />
                                    </div>
                                    <span>Biometric Unlock</span>
                                </div>
                                <Switch
                                    checked={isBiometricEnabled}
                                    onCheckedChange={(c) => c ? enableBiometric() : disableBiometric()}
                                    disabled={!isBiometricSupported}
                                />
                            </div>
                        )}
                    </div>
                </GlassCard>

                {/* Notifications Section */}
                <PushManager />

                {/* Data Management Section */}
                <GlassCard className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                            <Cloud size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Data & Sync</h2>
                            <p className="text-sm text-neutral-400">Manage your valuable data</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Sync Status */}
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex items-center gap-3">
                                {isOnline ? <Wifi size={20} className="text-emerald-500" /> : <WifiOff size={20} className="text-rose-500" />}
                                <div>
                                    <p className="font-medium">Sync Status</p>
                                    <p className="text-xs text-neutral-400">{isOnline ? "Online & Synced" : "Offline (Changes saved locally)"}</p>
                                </div>
                            </div>
                            <div className={cn("px-2 py-1 rounded text-xs font-bold", isOnline ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400")} suppressHydrationWarning>
                                {isOnline ? "ACTIVE" : "OFFLINE"}
                            </div>
                        </div>

                        {/* Export */}
                        {/* Export Options */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <FileJson size={16} className="text-neutral-400" />
                                <span>Export Data</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <button
                                    onClick={() => handleExport('csv')}
                                    disabled={isExporting}
                                    className="flex items-center justify-center gap-2 bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-500/20 py-3 rounded-lg text-sm transition-colors text-emerald-100"
                                >
                                    <FileSpreadsheet size={16} />
                                    Excel (CSV)
                                </button>

                                <button
                                    onClick={() => handleExport('pdf')}
                                    disabled={isExporting}
                                    className="flex items-center justify-center gap-2 bg-rose-900/30 hover:bg-rose-900/50 border border-rose-500/20 py-3 rounded-lg text-sm transition-colors text-rose-100"
                                >
                                    <FileText size={16} />
                                    Report (PDF)
                                </button>

                                <button
                                    onClick={() => handleExport('json')}
                                    disabled={isExporting}
                                    className="flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 border border-white/10 py-3 rounded-lg text-sm transition-colors text-neutral-300"
                                >
                                    <Download size={16} />
                                    Backup (JSON)
                                </button>
                            </div>
                        </div>
                        <p className="text-xs text-neutral-500">
                            Download your data in Excel format for analysis, PDF for sharing, or JSON for backup.
                        </p>
                    </div>
                </GlassCard>
            </div>
        </div>
    )
}

function Switch({ checked, onCheckedChange, disabled }: { checked: boolean, onCheckedChange: (c: boolean) => void, disabled?: boolean }) {
    return (
        <button
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onCheckedChange(!checked)}
            className={cn(
                "w-11 h-6 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-emerald-500",
                checked ? "bg-emerald-500" : "bg-neutral-700",
                disabled && "opacity-50 cursor-not-allowed"
            )}
        >
            <motion.div
                animate={{ x: checked ? 20 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm"
            />
        </button>
    )
}
