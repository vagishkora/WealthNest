
import { getStockQuotes } from "../lib/stocks";

async function main() {
    const tickers = ["IOC:NSE", "ZOMATO:NSE"];
    console.log("Testing getStockQuotes for:", tickers);
    const quotes = await getStockQuotes(tickers);
    console.log("Results:", JSON.stringify(quotes, null, 2));
}

main();
