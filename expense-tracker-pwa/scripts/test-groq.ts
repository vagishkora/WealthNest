
import Groq from 'groq-sdk';
import fs from 'fs';
import path from 'path';

// Manual .env parsing
let apiKey = '';
try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf-8');
        envConfig.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value && key.trim() === 'GROQ_API_KEY') {
                apiKey = value.trim().replace(/"/g, ''); // Remove quotes if present
            }
        });
    }
} catch (e) {
    console.log("Could not load .env file", e);
}

if (!apiKey) {
    console.error("❌ GROQ_API_KEY not found in .env");
} else {
    console.log("✅ Found API Key:", apiKey.substring(0, 5) + "...");
}

const groq = new Groq({ apiKey: apiKey });

async function main() {
    console.log("Testing Groq API...");

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: "Explain the importance of saving money in one sentence.",
                },
            ],
            model: "llama-3.3-70b-versatile",
        });

        console.log("✅ Success! Response:");
        console.log(chatCompletion.choices[0]?.message?.content || "");
    } catch (error: any) {
        console.error("❌ Error:", JSON.stringify(error, null, 2));
    }
}

main();
