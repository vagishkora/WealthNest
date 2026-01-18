
import yahooFinance from 'yahoo-finance2';

async function main() {
    try {
        const result = await yahooFinance.quote('AAPL');
        console.log("Success:", result.regularMarketPrice);
    } catch (e) {
        console.error("Error:", e);
    }
}

main();
