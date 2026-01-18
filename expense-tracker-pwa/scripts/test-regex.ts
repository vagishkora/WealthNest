
import fs from 'fs';

const html = fs.readFileSync('debug_stock.html', 'utf-8');

// Search for array starting with 161.something, followed by a comma
const looseRegex = /\[161\.\d+,/;
const looseMatch = html.match(looseRegex);

if (looseMatch) {
    const idx = looseMatch.index!;
    console.log("Found array start at:", idx);
    console.log("Prefix context:", html.substring(idx - 20, idx));
    console.log("Full match context:", html.substring(idx, idx + 50));
} else {
    console.log("Could not find [161.xx,");
}

