
async function main() {
    console.log("Fetching raw 122639...")
    const res = await fetch('https://api.mfapi.in/mf/122639')
    console.log("Status:", res.status)
    const text = await res.text()
    console.log("Body:", text.slice(0, 500)) // First 500 chars
}

main()
