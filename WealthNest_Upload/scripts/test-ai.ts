
import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs'
import path from 'path'

// dotenv.config() - Removing as module might be missing
// Manual .env parsing
try {
    const envPath = path.resolve(process.cwd(), '.env')
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf-8')
        envConfig.split('\n').forEach(line => {
            const [key, value] = line.split('=')
            if (key && value) {
                process.env[key.trim()] = value.trim()
            }
        })
    }
} catch (e) {
    console.log("Could not load .env file", e)
}

async function main() {
    console.log("Testing Gemini API...")

    if (!process.env.GOOGLE_API_KEY) {
        console.error("❌ GOOGLE_API_KEY is missing in .env")
        return
    }

    console.log("API Key present (length:", process.env.GOOGLE_API_KEY.length, ")")

    try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
        // Explicitly testing gemini-pro as we suspect model availability issues
        const model = genAI.getGenerativeModel({ model: "gemini-pro" })

        console.log("Sending prompt to gemini-pro...")
        const result = await model.generateContent("Say hello!")
        const response = await result.response
        const text = response.text()

        console.log("✅ Success! Response:", text)
    } catch (error: any) {
        console.error("❌ Error Full Details:", JSON.stringify(error, null, 2))
        if (error.response) {
            console.error("Response:", JSON.stringify(error.response, null, 2))
        }
    }
}

main()
