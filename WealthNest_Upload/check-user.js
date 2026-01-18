
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    console.log("Checking for user: vagishkora@gmail.com");
    const user = await prisma.user.findUnique({
        where: { email: 'vagishkora@gmail.com' }
    });

    if (user) {
        console.log("✅ User FOUND:", user.id, user.email, user.name);
    } else {
        console.log("❌ User NOT FOUND. You must register first.");
    }
}

check()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
