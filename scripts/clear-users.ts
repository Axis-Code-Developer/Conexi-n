import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Cleaning up User table...");
    try {
        // Delete all users
        await prisma.user.deleteMany({});
        console.log("All users deleted successfully.");
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
