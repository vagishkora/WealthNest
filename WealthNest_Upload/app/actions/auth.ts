'use server'

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { getTransporter } from "@/lib/email"
import { randomInt } from "crypto"

const RegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional(),
})

export async function registerUser(formData: FormData) {
    const validatedFields = RegisterSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
        name: formData.get('name') || undefined,
    })

    if (!validatedFields.success) {
        return { error: "Invalid fields" }
    }

    const { email, password, name } = validatedFields.data

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) return { error: "User already exists" }

        const hashedPassword = await bcrypt.hash(password, 10)
        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: name || email.split('@')[0],
            },
        })
        return { success: true }
    } catch (error) {
        return { error: "Failed to register" }
    }
}

export async function sendOtp(email: string) {
    try {
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) return { error: "User not found" }

        const otp = randomInt(100000, 999999).toString()
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 mins

        await prisma.user.update({
            where: { email },
            data: { otp, otpExpiry }
        })

        const transporter = await getTransporter()
        const info = await transporter.sendMail({
            from: '"WealthNest Security" <security@wealthnest.app>',
            to: email,
            subject: "Reset Your Password - WealthNest",
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2>Password Reset Request</h2>
                    <p>Your verification code is:</p>
                    <h1 style="letter-spacing: 5px; background: #f4f4f4; padding: 10px; display: inline-block; border-radius: 8px;">${otp}</h1>
                    <p>This code expires in 10 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                </div>
            `
        })

        console.log("OTP Sent:", info.messageId)

        // Log Ethereal Preview URL for Development
        const nodemailer = require('nodemailer');
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log("\n========================================================");
            console.log("📧 Ethereal Email Preview (Click to see OTP):", previewUrl);
            console.log("========================================================\n");
        }

        return { success: true }
    } catch (error: any) {
        console.error("OTP Error Details:", {
            message: error.message,
            code: error.code,
            response: error.response,
            command: error.command
        })
        return { error: "Failed to send OTP: " + (error.message || "Unknown error") }
    }
}

export async function resetPassword(email: string, otp: string, newPass: string) {
    try {
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) return { error: "User not found" }

        if (!user.otp || !user.otpExpiry || user.otp !== otp) {
            return { error: "Invalid OTP" }
        }

        if (new Date() > user.otpExpiry) {
            return { error: "OTP Expired" }
        }

        const hashedPassword = await bcrypt.hash(newPass, 10)

        await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                otp: null,
                otpExpiry: null
            }
        })

        return { success: true }
    } catch (error) {
        return { error: "Failed to reset password" }
    }
}
