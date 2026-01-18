"use client"

import { useState, useEffect } from "react"
import { useAppLock } from "@/context/AppLockContext"
import { motion } from "framer-motion"
import { Lock, Unlock, ScanFace } from "lucide-react"

export function LockScreen() {
    const { isLocked, unlock, authenticateWithBiometric, isBiometricEnabled } = useAppLock()
    const [pin, setPin] = useState("")
    const [error, setError] = useState(false)

    useEffect(() => {
        if (pin.length === 4) {
            const success = unlock(pin)
            if (success) {
                setPin("")
                setError(false)
            } else {
                setError(true)
                setTimeout(() => {
                    setPin("")
                    setError(false)
                }, 500)
            }
        }
    }, [pin, unlock])

    const handleNumClick = (num: string) => {
        if (pin.length < 4) {
            setPin(prev => prev + num)
        }
    }

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1))
    }

    if (!isLocked) return null

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/50 via-neutral-950 to-black backdrop-blur-xl flex items-center justify-center p-4"
        >
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px]" />
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full max-w-sm relative z-10"
            >
                <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/50">
                    <div className="flex flex-col items-center gap-8">
                        <div className="flex flex-col items-center gap-4">
                            <motion.div
                                animate={{
                                    boxShadow: error ? "0 0 20px rgba(239, 68, 68, 0.4)" : "0 0 20px rgba(16, 185, 129, 0.2)"
                                }}
                                className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white transition-colors duration-300 ${error ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-emerald-400'}`}
                            >
                                {isLocked ? <Lock size={32} /> : <Unlock size={32} />}
                            </motion.div>
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-white tracking-tight">WealthNest</h2>
                                <p className="text-neutral-400 text-sm mt-1">Enter your PIN to access</p>
                            </div>
                        </div>

                        {/* PIN Dots */}
                        <div className="flex gap-6 h-4">
                            {[0, 1, 2, 3].map(i => (
                                <motion.div
                                    key={i}
                                    initial={false}
                                    animate={{
                                        scale: i < pin.length ? 1.2 : 1,
                                        backgroundColor: i < pin.length ? (error ? "#ef4444" : "#10b981") : "rgba(255,255,255,0.2)"
                                    }}
                                    className="w-3 h-3 rounded-full transition-all duration-300"
                                />
                            ))}
                        </div>

                        {/* Keypad */}
                        <div className="grid grid-cols-3 gap-y-6 gap-x-8 w-full max-w-[280px]">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                <motion.button
                                    key={num}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleNumClick(num.toString())}
                                    className="w-16 h-16 rounded-full text-2xl font-medium text-white hover:bg-white/10 transition-colors flex items-center justify-center outline-none focus:bg-white/10"
                                >
                                    {num}
                                </motion.button>
                            ))}

                            {/* Biometric Button */}
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={authenticateWithBiometric}
                                disabled={!isBiometricEnabled}
                                className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${isBiometricEnabled ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-neutral-600 cursor-not-allowed'}`}
                            >
                                <ScanFace size={24} />
                            </motion.button>

                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleNumClick("0")}
                                className="w-16 h-16 rounded-full text-2xl font-medium text-white hover:bg-white/10 transition-colors flex items-center justify-center outline-none focus:bg-white/10"
                            >
                                0
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={handleDelete}
                                className="w-16 h-16 rounded-full text-sm font-bold text-neutral-400 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center uppercase tracking-wider"
                            >
                                Del
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}
