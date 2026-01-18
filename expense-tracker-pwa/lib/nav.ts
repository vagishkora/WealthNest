
export interface NavData {
    nav: number;
    previousNav: number;
    date: string;
}

export async function getLiveNAVs(amfiCodes: string[]) {
    // Filter out nulls/empty
    const codes = amfiCodes.filter(c => c);
    if (codes.length === 0) return {};

    const results: Record<string, NavData> = {};

    // Fetch in parallel
    const promises = codes.map(async (code) => {
        if (!code || typeof code !== 'string') return;
        try {
            const res = await fetch(`https://api.mfapi.in/mf/${code.trim()}`, { next: { revalidate: 3600, tags: ['nav'] } });
            if (res.ok) {
                const data = await res.json();
                if (data.data && data.data.length > 0) {
                    const current = parseFloat(data.data[0].nav);
                    const previous = data.data.length > 1 ? parseFloat(data.data[1].nav) : current;
                    results[code] = {
                        nav: current,
                        previousNav: previous,
                        date: data.data[0].date
                    };
                }
            }
        } catch (e) {
            // Use warn to avoid crashing the dev overlay
            console.warn(`[NAV Fetch Warn] Failed to fetch for ${code}: ${(e as Error).message}`);
        }
    });

    await Promise.all(promises);
    return results;
}
