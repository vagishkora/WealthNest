
import fs from 'fs';

async function main() {
    const symbol = "IOC:NSE";
    const url = `https://www.google.com/finance/quote/${symbol}`;
    console.log(`Fetching ${url}...`);

    const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" }
    });

    const html = await res.text();
    fs.writeFileSync('debug_stock.html', html);
    console.log("Saved HTML to debug_stock.html");
}

main();
