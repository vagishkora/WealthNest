
import { refreshData } from './app/actions/refresh'

async function main() {
    console.log("Triggering refresh...")
    await refreshData()
    console.log("Done")
}

main()
