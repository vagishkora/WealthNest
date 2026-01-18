
// We can't easily test "use server" actions directly in a simple script unless we mock 'auth'.
// But we can test the underlying lib/stocks function.
import { getStockDetails } from "../lib/stocks";

async function test() {
    console.log("Testing getStockDetails directly...");
    const res = await getStockDetails("ZOMATO:NSE");
    console.log("Result:", res);
}

test();
