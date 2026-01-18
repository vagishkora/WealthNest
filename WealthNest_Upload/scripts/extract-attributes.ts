
import fs from 'fs';
import { JSDOM } from 'jsdom';

const html = fs.readFileSync('debug_stock.html', 'utf-8');
const dom = new JSDOM(html);
const doc = dom.window.document;

const el = doc.querySelector('[data-last-price]');

if (el) {
    console.log("Found element:", el.tagName);
    console.log("Attributes:");
    for (const attr of el.attributes) {
        console.log(`  ${attr.name}="${attr.value}"`);
    }
} else {
    console.log("Element with data-last-price NOT FOUND via selector");
}
