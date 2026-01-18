import * as cheerio from 'cheerio';

export interface StockQuote {
    symbol: string;
    price: number;
    previousClose: number;
    change: number;
    changePercent: number;
}

// Helper to convert Yahoo symbol (TCS.NS) to Google (TCS:NSE)
function toGoogleSymbol(symbol: string): string {
    if (symbol.includes(':')) return symbol; // Already Google format
    if (symbol.endsWith('.NS')) return `${symbol.replace('.NS', '')}:NSE`;
    if (symbol.endsWith('.BO')) return `${symbol.replace('.BO', '')}:BOM`;
    return symbol; // Fallback
}

const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const quoteCache: Record<string, { data: StockQuote, timestamp: number }> = {};

export async function getStockQuotes(symbols: string[]): Promise<Record<string, StockQuote>> {
    const results: Record<string, StockQuote> = {};
    if (symbols.length === 0) return results;

    // Filter symbols that need fetching
    const now = Date.now();
    const symbolsToFetch: string[] = [];

    symbols.forEach(symbol => {
        const cached = quoteCache[symbol];
        if (cached && (now - cached.timestamp < CACHE_DURATION_MS)) {
            results[symbol] = cached.data;
        } else {
            symbolsToFetch.push(symbol);
        }
    });

    if (symbolsToFetch.length === 0) return results;

    // Fetch missed symbols in parallel
    await Promise.all(symbolsToFetch.map(async (originalSymbol) => {
        const details = await getStockDetails(originalSymbol);
        if (details) {
            const quote = {
                symbol: originalSymbol,
                price: details.price,
                previousClose: details.previousClose || details.price,
                change: details.change || 0,
                changePercent: details.changePercent || 0
            };

            // Update Cache
            quoteCache[originalSymbol] = {
                data: quote,
                timestamp: Date.now()
            };
            results[originalSymbol] = quote;
        }
    }));

    return results;
}

interface StockDetails {
    ticker: string;
    name: string;
    price: number;
    previousClose: number;
    change: number;
    changePercent: number;
}

export async function getStockDetails(symbol: string): Promise<StockDetails | null> {
    // Try to guess exchange if missing (Default to NSE for India context)
    let searchSymbol = symbol.toUpperCase();
    if (!searchSymbol.includes(':')) {
        // Simple heuristic: if 3-5 chars, likely NSE. 
        // We can just try appending :NSE and see if it hits.
        searchSymbol = `${searchSymbol}:NSE`;
    }

    try {
        const url = `https://www.google.com/finance/quote/${searchSymbol}`;
        console.log(`Fetching stock details from: ${url}`);
        const res = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" }
        });

        console.log(`Response Status: ${res.status}`);
        if (!res.ok) return null;

        const html = await res.text();
        const $ = cheerio.load(html);

        const pageTitle = $('title').text();
        console.log(`Page Title: ${pageTitle}`);

        const priceEl = $(".YMlKec.fxKbKc");
        const nameEl = $(".zzDege");

        let price = 0;
        let change = 0;
        let changePercent = 0;
        let name = symbol;

        // Strategy 1: Selectors (Best for Name)
        if (priceEl.length) {
            price = parseFloat(priceEl.text().replace(/[^0-9.]/g, "") || "0");
        }
        if (nameEl.length) {
            name = nameEl.text() || symbol;
        } else {
            if (pageTitle.includes(" - Google Finance")) {
                name = pageTitle.split(" - Google Finance")[0];
            }
        }

        // Strategy 2: Data Attributes (Reliable for Price)
        const dataPriceEl = $('[data-last-price]');
        if (dataPriceEl.length) {
            const pStr = dataPriceEl.attr('data-last-price');
            const p = parseFloat(pStr || "0");
            if (p > 0) price = p;

            // Strategy 3: Dynamic Regex using the found price
            if (pStr) {
                const escapedPrice = pStr.replace('.', '\\.');
                const dynamicRegex = new RegExp(`\\[${escapedPrice},\\s*([+-]?\\d+(?:\\.\\d+)?),\\s*([+-]?\\d+(?:\\.\\d+)?)`);
                const match = html.match(dynamicRegex);
                if (match) {
                    change = parseFloat(match[1]);
                    changePercent = parseFloat(match[2]);
                }
            }
        }

        // Strategy 4: Fallback Static Regex (if Strategy 2/3 failed)
        if (price === 0 || change === 0) {
            // Try the null,null pattern again just in case
            const jsonMatch = html.match(/null,null,\[(\d+(?:\.\d+)?),([+-]?\d+(?:\.\d+)?),([+-]?\d+(?:\.\d+)?)/);
            if (jsonMatch) {
                if (price === 0) price = parseFloat(jsonMatch[1]);
                if (change === 0) change = parseFloat(jsonMatch[2]);
                if (changePercent === 0) changePercent = parseFloat(jsonMatch[3]);
            }
        }

        // Strategy 5: Text Fallback (Last Resort)
        if (price === 0) {
            const text = $('body').text() || "";
            const currencyMatch = text.match(/[₹$]\s?([0-9,]+\.[0-9]{2})/);
            if (currencyMatch) {
                price = parseFloat(currencyMatch[1].replace(/,/g, ""));
            }
        }

        if (change === 0 && changePercent === 0) {
            // Fallback text regex for change
            const text = $('body').text() || "";
            const changeMatch = text.match(/\(([+-]?[0-9,]+\.[0-9]{2})%\)/);
            if (changeMatch) {
                changePercent = parseFloat(changeMatch[1]);
                if (price > 0) {
                    const prev = price / (1 + (changePercent / 100));
                    change = price - prev;
                }
            }
        }

        if (price > 0) {
            const previousClose = price - change;

            return {
                ticker: searchSymbol,
                name: name,
                price: price,
                previousClose: previousClose,
                change: change,
                changePercent: changePercent
            };
        }
        return null;
    } catch (error) {
        console.error("Error fetching details:", error);
        return null;
    }
}

// Deprecated or Mocked Search (Google Finance Search is hard to scrape)
// We return empty for now, or could implement a basic text match if needed.
export async function searchStocks(query: string) {
    return [];
}
