
import { prisma } from "../lib/prisma";

async function main() {
    const inv = await prisma.investment.findFirst({
        where: { name: { contains: "Parag" } }
    });
    console.log("Investment:", inv);
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
