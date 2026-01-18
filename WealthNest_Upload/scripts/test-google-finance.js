
const { JSDOM } = require("jsdom");

async function getStockPrice(symbol) {
    // Format: "RELIANCE:NSE" or "GOOGL:NASDAQ"
    // If user passes just "RELIANCE", we might need to search or default.
    // Let's assume user provides full Google Finance sticker for now: "TCS:NSE"

    // Quick mapping if needed, but let's try direct first.
    // Try to guess exchange if missing? 
    // For now, test with explicit: "INES.BO" -> Google format might be different.

    const url = `https://www.google.com/finance/quote/${symbol}`;
    console.log(`Fetching ${url}...`);

    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
        });

        const html = await response.text();
        const dom = new JSDOM(html);
        const document = dom.window.document;

        // Google Finance Class Names
        const priceElement = document.querySelector(".YMlKec.fxKbKc");
        const nameElement = document.querySelector(".zzDege"); // Common class for company name

        const priceText = priceElement ? priceElement.textContent : null;
        const nameText = nameElement ? nameElement.textContent : null;

        if (priceText) {
            const price = parseFloat(priceText.replace(/[^0-9.]/g, ""));
            console.log(`✅ ${symbol} | Name: "${nameText || 'Unknown'}" | Price: ${price}`);
            return price;
        } else {
            console.error(`❌ Could not find price element for ${symbol}`);
        }

    } catch (error) {
        console.error("Fetch Error:", error.message);
    }
}

// Test
(async () => {
    async function test(symbol) {
        // Try guessing exchange if missing
        const fullSymbol = symbol.includes(':') ? symbol : `${symbol}:NSE`;
        await getStockPrice(fullSymbol);
    }

    await test("TCS");
    await test("IOC");
    await test("RELIANCE");
})();
