
import fs from 'fs';

const html = fs.readFileSync('debug_stock.html', 'utf-8');
const search = "2.4799";
const index = html.indexOf(search);

if (index !== -1) {
    const start = Math.max(0, index - 100);
    const end = Math.min(html.length, index + 100);
    console.log("Found match at index", index);
    console.log("Context:");
    console.log(html.substring(start, end));
} else {
    console.log("String not found");
}
