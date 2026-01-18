"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface AppLockContextType {
    isLocked: boolean
    isSetup: boolean
    isBiometricEnabled: boolean
    isBiometricSupported: boolean
    unlock: (pin: string) => boolean
    setupLock: (pin: string) => void
    lock: () => void
    removeLock: () => void
    enableBiometric: () => Promise<boolean | void>
    disableBiometric: () => void
    authenticateWithBiometric: () => Promise<boolean>
}

const AppLockContext = createContext<AppLockContextType | null>(null)

export function AppLockProvider({ children }: { children: React.ReactNode }) {
    const [isLocked, setIsLocked] = useState(false)
    const [isSetup, setIsSetup] = useState(false)
    const [savedPin, setSavedPin] = useState<string | null>(null)
    const [isBiometricEnabled, setIsBiometricEnabled] = useState(false)
    const [isBiometricSupported, setIsBiometricSupported] = useState(false)

    // Load initial state
    useEffect(() => {
        const pin = localStorage.getItem('app_pin')
        const bio = localStorage.getItem('app_biometric_enabled') === 'true'

        if (pin) {
            setSavedPin(pin)
            setIsSetup(true)
            setIsLocked(true) // Always lock on reload if setup
            setIsBiometricEnabled(bio)
        }

        // Check availability on mount
        checkBiometricSupport()
    }, [])

    const checkBiometricSupport = async () => {
        if (!window.PublicKeyCredential) return false
        try {
            const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
            setIsBiometricSupported(available)
            return available
        } catch {
            return false
        }
    }

    const enableBiometric = async () => {
        if (!window.PublicKeyCredential) {
            alert("Biometrics not supported on this browser.")
            return
        }

        try {
            // Create a "registration" to verify device ownership & capability
            // In a real app we'd send this to server. Here we just verify it works.
            const publicKey: PublicKeyCredentialCreationOptions = {
                challenge: new Uint8Array(32), // Random challenge
                rp: { name: "WealthNest", id: window.location.hostname },
                user: {
                    id: new Uint8Array(16),
                    name: "User",
                    displayName: "WealthNest User"
                },
                pubKeyCredParams: [{ type: "public-key", alg: -7 }], // ES256
                authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
                timeout: 60000,
                attestation: "none"
            };

            await navigator.credentials.create({ publicKey })

            // If successful, save preference
            localStorage.setItem('app_biometric_enabled', 'true')
            setIsBiometricEnabled(true)
            return true
        } catch (error) {
            console.error(error)
            alert("Biometric setup failed or cancelled.")
            return false
        }
    }

    const disableBiometric = () => {
        localStorage.removeItem('app_biometric_enabled')
        setIsBiometricEnabled(false)
    }

    const authenticateWithBiometric = async () => {
        if (!isBiometricEnabled) return false

        try {
            const publicKey: PublicKeyCredentialRequestOptions = {
                challenge: new Uint8Array(32),
                timeout: 60000,
                userVerification: "required"
            }

            // This triggers the TouchID / FaceID / Windows Hello prompt
            await navigator.credentials.get({ publicKey })

            // If we get here, the OS verified the user
            unlock(savedPin || "") // Unlock internally
            return true
        } catch (error) {
            return false
        }
    }

    // Auto-prompt on lock screen if enabled
    /*
    useEffect(() => {
        if (isLocked && isBiometricEnabled && isBiometricSupported) {
            // Optional: Auto-trigger on load. Can be annoying, better to have a button.
            // authenticateWithBiometric()
        }
    }, [isLocked])
    */

    const unlock = (pin: string) => {
        if (pin === savedPin) {
            setIsLocked(false)
            return true
        }
        return false
    }

    const setupLock = (pin: string) => {
        localStorage.setItem('app_pin', pin)
        setSavedPin(pin)
        setIsSetup(true)
        setIsLocked(false)
    }

    const removeLock = () => {
        localStorage.removeItem('app_pin')
        localStorage.removeItem('app_biometric_enabled')
        setSavedPin(null)
        setIsSetup(false)
        setIsLocked(false)
        setIsBiometricEnabled(false)
    }

    const lock = () => {
        if (isSetup) setIsLocked(true)
    }

    return (
        <AppLockContext.Provider value={{
            isLocked, isSetup, isBiometricEnabled, isBiometricSupported,
            unlock, setupLock, lock, removeLock,
            enableBiometric, disableBiometric, authenticateWithBiometric
        }}>
            {children}
        </AppLockContext.Provider>
    )
}

export function useAppLock() {
    const context = useContext(AppLockContext)
    if (!context) throw new Error("useAppLock must be used within AppLockProvider")
    return context
}
