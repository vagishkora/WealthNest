'use client'

import { useState } from 'react'
import { sendOtp, resetPassword } from '@/app/actions/auth'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<'EMAIL' | 'OTP' | 'PASSWORD'>('EMAIL')
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    async function handleSendOtp(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        const res = await sendOtp(email)
        setLoading(false)

        if (res.error) {
            setError(res.error)
        } else {
            setStep('OTP')
        }
    }

    async function handleVerifyOtp(e: React.FormEvent) {
        e.preventDefault()
        // We verify OTP implicitly by submitting password, but for UX we can just move to next step
        // Or strictly we should verify OTP first? 
        // The server action 'resetPassword' checks OTP. 
        // So let's just move to Password input.
        if (otp.length !== 6) {
            setError("Please enter a 6-digit code")
            return
        }
        setStep('PASSWORD')
    }

    async function handleResetSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError('')
        const formData = new FormData(e.currentTarget)
        const password = formData.get('password') as string
        const confirm = formData.get('confirm') as string

        if (password !== confirm) {
            setError("Passwords do not match")
            setLoading(false)
            return
        }

        const res = await resetPassword(email, otp, password)
        setLoading(false)

        if (res.error) {
            setError(res.error)
            // If invalid OTP, go back?
            if (res.error.includes("OTP")) setStep('OTP')
        } else {
            // Success
            alert("Password Reset Successfully!")
            router.push('/login')
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 p-6 text-neutral-100">
            <div className="w-full max-w-sm space-y-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold tracking-tight">Reset Password</h1>
                    <p className="mt-2 text-sm text-neutral-400">
                        {step === 'EMAIL' && "Enter your email to receive a code"}
                        {step === 'OTP' && `Enter the code sent to ${email}`}
                        {step === 'PASSWORD' && "Set your new password"}
                    </p>
                </div>

                <div className="bg-neutral-900/50 p-6 rounded-xl border border-white/5">
                    {step === 'EMAIL' && (
                        <form onSubmit={handleSendOtp} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-400">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="mt-1 block w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-white focus:border-neutral-500 focus:outline-none"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                            <button disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-neutral-200 focus:outline-none disabled:opacity-50">
                                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Send Code"}
                            </button>
                        </form>
                    )}

                    {step === 'OTP' && (
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-400">Verification Code</label>
                                <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    className="mt-1 block w-full text-center tracking-[1em] font-mono text-xl rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-white focus:border-neutral-500 focus:outline-none"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value)}
                                />
                            </div>
                            <button className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-neutral-200">
                                Verify Code
                            </button>
                            <button type="button" onClick={() => setStep('EMAIL')} className="w-full text-sm text-neutral-500 hover:text-white">
                                Wrong email? Go back
                            </button>
                        </form>
                    )}

                    {step === 'PASSWORD' && (
                        <form onSubmit={handleResetSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-400">New Password</label>
                                <input type="password" name="password" required className="mt-1 block w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-white focus:border-neutral-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-400">Confirm Password</label>
                                <input type="password" name="confirm" required className="mt-1 block w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-white focus:border-neutral-500 focus:outline-none" />
                            </div>
                            <button disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-neutral-200">
                                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Reset Password"}
                            </button>
                        </form>
                    )}

                    {error && (
                        <div className="mt-4 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}
                </div>

                <div className="text-center">
                    <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors">
                        <ArrowLeft size={16} /> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    )
}
