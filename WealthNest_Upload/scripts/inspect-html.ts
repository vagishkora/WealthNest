
import fs from 'fs';
import { JSDOM } from 'jsdom';

const html = fs.readFileSync('debug_stock.html', 'utf-8');
const dom = new JSDOM(html);
const doc = dom.window.document;

console.log("Title:", doc.title);

// Try current selectors
const priceEl = doc.querySelector(".YMlKec.fxKbKc");
const nameEl = doc.querySelector(".zzDege");

console.log("Selector .YMlKec.fxKbKc content:", priceEl ? priceEl.textContent : "NOT FOUND");
console.log("Selector .zzDege content:", nameEl ? nameEl.textContent : "NOT FOUND");

// Search for price "161" (approx)
const text = doc.body.textContent || "";
const priceMatch = text.match(/[₹$]\s?([0-9,]+\.[0-9]{2})/);
console.log("Regex Price Match:", priceMatch ? priceMatch[0] : "NOT FOUND");

// Search for percentage change
const changeMatch = text.match(/\(([+-]?[0-9,]+\.[0-9]{2})%\)/);
console.log("Regex Change Match:", changeMatch ? changeMatch[0] : "NOT FOUND");

// Look for ALL elements with text containing "%"
const percentEls = Array.from(doc.querySelectorAll('*')).filter(el =>
    el.children.length === 0 && el.textContent && el.textContent.includes('%') && el.textContent.includes('(')
);
console.log("Elements containing '(%)':");
percentEls.forEach(el => {
    console.log(`Tag: ${el.tagName}, Class: ${el.className}, Text: ${el.textContent}`);
});

// Look for elements with price
const priceEls = Array.from(doc.querySelectorAll('*')).filter(el =>
    el.children.length === 0 && el.textContent && el.textContent.includes('161.')
);
console.log("Elements containing '161.':");
priceEls.forEach(el => {
    console.log(`Tag: ${el.tagName}, Class: ${el.className}, Text: ${el.textContent}`);
});
