'use client'

import { useState } from 'react'
import { registerUser } from '@/app/actions/auth'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true)
    const router = useRouter()
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError('')
        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                setError("Invalid credentials")
            } else {
                router.push('/dashboard')
                router.refresh()
            }
        } catch (err) {
            setError("Something went wrong")
        }
    }

    async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError('')
        const formData = new FormData(e.currentTarget)
        const res = await registerUser(formData)
        if (res.error) {
            setError(res.error)
        } else {
            setIsLogin(true)
            setError("Account created! Please login.")
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 p-6 text-neutral-100" suppressHydrationWarning>
            <div className="w-full max-w-sm space-y-8" suppressHydrationWarning>
                <div className="text-center" suppressHydrationWarning>
                    <h1 className="text-3xl font-bold tracking-tight">WealthNest</h1>
                    <p className="mt-2 text-neutral-400">
                        {isLogin ? "Sign in to your account" : "Create a new account"}
                    </p>
                </div>

                <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-6">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-neutral-300">Full Name</label>
                            <input
                                name="name"
                                type="text"
                                required
                                placeholder="John Doe"
                                className="mt-1 block w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-neutral-100 placeholder-neutral-500 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                                suppressHydrationWarning
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-neutral-300">Email</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="mt-1 block w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-neutral-100 placeholder-neutral-500 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                            suppressHydrationWarning
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-300">Password</label>
                        <div className="relative mt-1" suppressHydrationWarning>
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                className="block w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-neutral-100 placeholder-neutral-500 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 pr-10"
                                suppressHydrationWarning
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-500 hover:text-white"
                                suppressHydrationWarning
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-end" suppressHydrationWarning>
                        <Link href="/forgot-password" className="text-sm font-medium text-neutral-500 hover:text-white transition-colors">
                            Forgot password?
                        </Link>
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <button
                        type="submit"
                        className="flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                        suppressHydrationWarning
                    >
                        {isLogin ? "Sign in" : "Sign up"}
                    </button>
                </form>

                <p className="text-center text-sm text-neutral-500">
                    {isLogin ? "New here? " : "Already have an account? "}
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin)
                            setError('')
                        }}
                        className="font-semibold leading-6 text-white hover:text-neutral-300"
                        suppressHydrationWarning
                    >
                        {isLogin ? "Create account" : "Sign in"}
                    </button>
                </p>
            </div>
        </div>
    )
}
