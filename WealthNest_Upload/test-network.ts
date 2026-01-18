
async function main() {
    try {
        const res = await fetch('https://www.google.com')
        console.log("Internet connectivty check:", res.status)
    } catch (e) {
        console.error("No internet:", e)
    }
}
main()
