
import nodemailer from 'nodemailer';

// Configure Transporter
// For Development: Use Ethereal (Fake Inbox)
// For Production: Use Gmail or Resend (configure ENV vars)

export const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'maddison53@ethereal.email', // Placeholder - will replace or log credentials if creation logic added
        pass: 'jn7jnAPss4f63QBp6D'
    }
});

// Since we are running locally, let's just log the preview URL instead of failing on bad auth
// Or actually, let's use a "Stream" transport for dev/demo if no env var? 
// No, Ethereal is better for realistic testing. 
// BUT, usually creating a test account dynamically is better check.

export async function getTransporter() {
    // Check if we have ENV vars for real email
    if (process.env.SMTP_HOST) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    // Fallback: Generate Ethereal Account for every run (or cache it)
    // For simplicity, let's create a test account on the fly if needed.
    const testAccount = await nodemailer.createTestAccount();

    console.log("📧 Ethereal Test Account Created:", testAccount.user);

    return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
    });
}
