
import * as XLSX from 'xlsx';
const PDFParser = require("pdf2json");

export interface CasTransaction {
    date: Date;
    description: string;
    amount: number;
    units: number;
    price: number;
    type: 'PURCHASE' | 'REDEMPTION' | 'SWITCH_IN' | 'SWITCH_OUT' | 'DIVIDEND' | 'UNKNOWN';
}

export interface CasScheme {
    name: string;
    advisor?: string;
    type: string;
    amfiCode?: string; // Often not in CAS, need to lookup by name or ISIN if present
    isin?: string;
    folio: string;
    transactions: CasTransaction[];
}

export interface CasData {
    statementPeriod?: string;
    schemes: CasScheme[];
}

export async function parseCasPdf(buffer: Buffer, password?: string): Promise<CasData> {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, 1); // 1 = text content

        pdfParser.on("pdfParser_dataError", (errData: any) => {
            console.error("PDF2JSON Error:", errData);
            reject(new Error("Failed to parse PDF. Check password or format."));
        });

        pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
            try {
                // pdf2json returns text in URI encoded format within Pages -> Texts -> R -> T
                // Reconstructing text line by line is complex.
                // Fortunately, the '1' mode (text) produces a 'RawTextContent' (deprecated?) or we can iterate.
                // Actually, pdfParser.getRawTextContent() is the easiest way if available.

                const rawText = pdfParser.getRawTextContent();
                resolve(parseCasText(rawText));
            } catch (e) {
                reject(e);
            }
        });

        // Handle password?
        // pdf2json doesn't seem to have explicit password option in parseBuffer?
        // It might just fail if encrypted. 
        // If the user provided a password, we might need a different lib if pdf2json fails.
        // But let's try.
        try {
            pdfParser.parseBuffer(buffer);
        } catch (e) {
            reject(e);
        }
    });
}

export async function parseExcel(buffer: Buffer): Promise<CasData> {
    try {
        const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        return parseExcelRows(jsonData);
    } catch (error) {
        console.error("Excel Parse Error:", error);
        throw new Error("Failed to parse Excel file.");
    }
}

function parseExcelRows(rows: any[]): CasData {
    const schemes: Record<string, CasScheme> = {};
    const normalizeKey = (k: string) => k.toLowerCase().replace(/[^a-z0-9]/g, '');

    for (const row of rows) {
        const keys = Object.keys(row);
        const keyMap: Record<string, string> = {};

        keys.forEach(k => {
            const n = normalizeKey(k);
            if (n.includes('date')) keyMap['date'] = k;
            if (n.includes('scheme') || n.includes('scrip') || n.includes('symbol')) keyMap['scheme'] = k;
            if (n.includes('folio')) keyMap['folio'] = k;
            if (n.includes('amount') || n.includes('value')) keyMap['amount'] = k;
            if (n.includes('unit') || n.includes('quantity')) keyMap['units'] = k;
            if (n.includes('price') || n.includes('nav') || n.includes('rate')) keyMap['price'] = k;
            if (n.includes('type') || n.includes('desc')) keyMap['type'] = k;
        });

        if (!keyMap['date'] || !keyMap['scheme'] || !keyMap['amount']) continue;

        const schemeName = row[keyMap['scheme']];
        const rawDate = row[keyMap['date']];
        const rawAmount = row[keyMap['amount']];
        const rawUnits = row[keyMap['units']] || 0;
        const rawPrice = row[keyMap['price']] || 0;
        const rawType = row[keyMap['type']] || "PURCHASE";
        const folio = row[keyMap['folio']] || "UNKNOWN";

        let date = new Date(rawDate);
        if (isNaN(date.getTime())) continue;

        const schemeKey = `${schemeName}-${folio}`;

        if (!schemes[schemeKey]) {
            schemes[schemeKey] = {
                name: schemeName,
                folio: folio,
                type: 'Mutual Fund',
                transactions: []
            };
        }

        let type: CasTransaction['type'] = 'PURCHASE';
        const typeStr = String(rawType).toLowerCase();
        let amount = parseFloat(rawAmount);

        if (typeStr.includes('redemption') || typeStr.includes('sell') || amount < 0) {
            type = 'REDEMPTION';
            amount = Math.abs(amount);
        } else {
            type = 'PURCHASE';
        }

        schemes[schemeKey].transactions.push({
            date,
            description: String(rawType),
            amount,
            units: parseFloat(rawUnits),
            price: parseFloat(rawPrice),
            type
        });
    }

    return { schemes: Object.values(schemes) };
}

function parseCasText(text: string): CasData {
    const lines = text.split(/\r?\n/);
    const schemes: CasScheme[] = [];

    let currentScheme: CasScheme | null = null;
    let currentFolio = "";
    const folioRegex = /Folio No\s*[:\.]\s*([0-9\/]+)/i;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const folioMatch = line.match(folioRegex);
        if (folioMatch) {
            currentFolio = folioMatch[1];
            continue;
        }

        const txnMatch = parseTransactionLine(line);
        if (txnMatch) {
            if (currentScheme) {
                currentScheme.transactions.push(txnMatch);
            } else {
                const likelyName = findSchemeNameLookback(lines, i);
                if (likelyName) {
                    currentScheme = {
                        name: likelyName,
                        folio: currentFolio,
                        type: 'Mutual Fund',
                        transactions: [txnMatch]
                    };
                    schemes.push(currentScheme);
                }
            }
        }
    }
    return { schemes: schemes.filter(s => s.transactions.length > 0) };
}

function parseTransactionLine(line: string): CasTransaction | null {
    const dateMatch = line.match(/^(\d{2}-[A-Za-z]{3}-\d{4})/); // CAMS format mainly
    if (!dateMatch) return null;

    const dateStr = dateMatch[1];
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;

    const remaining = line.substring(dateStr.length).trim();
    const numberMatches = remaining.match(/(-?[\d,]+\.\d+)|(-?\d+)/g);

    if (!numberMatches || numberMatches.length < 2) return null;

    const numericValues = numberMatches.map(s => parseFloat(s.replace(/,/g, '')));
    const descEndIndex = remaining.indexOf(numberMatches[0]);
    const description = remaining.substring(0, descEndIndex).trim();

    let amount = 0;
    let units = 0;
    let price = 0;

    if (numericValues.length >= 3) {
        amount = Math.abs(numericValues[0]);
        units = Math.abs(numericValues[1]);
        price = Math.abs(numericValues[2]);
    } else if (numericValues.length === 2) {
        amount = Math.abs(numericValues[0]);
        units = Math.abs(numericValues[1]);
    }

    let type: CasTransaction['type'] = 'UNKNOWN';
    const lowerDesc = description.toLowerCase();

    if (lowerDesc.includes('purchase') || lowerDesc.includes('sip') || lowerDesc.includes('investment')) {
        type = 'PURCHASE';
    } else if (lowerDesc.includes('redemption') || lowerDesc.includes('repurchase') || lowerDesc.includes('swp')) {
        type = 'REDEMPTION';
    } else if (lowerDesc.includes('switch in')) {
        type = 'SWITCH_IN';
    } else if (lowerDesc.includes('switch out')) {
        type = 'SWITCH_OUT';
    }

    if (lowerDesc.includes('stamp duty') || lowerDesc.includes('stt')) return null;

    return { date, description, amount, units, price, type };
}

function findSchemeNameLookback(lines: string[], currentIndex: number): string | null {
    for (let i = 1; i <= 10; i++) {
        if (currentIndex - i < 0) break;
        const line = lines[currentIndex - i].trim();
        if (line.match(/^(\d{2}-)/)) continue;
        if (line.includes("Folio No")) continue;
        if (line.includes("Date") && line.includes("Transaction")) continue;
        if ((line.includes("Fund") || line.includes("Plan") || line.includes("Equity")) && line.length > 10) {
            return line;
        }
    }
    return null;
}
