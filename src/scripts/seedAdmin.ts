import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function seedAdmin() {
    console.log("******** Admin Seeding Started ********");

    const adminEmail = process.env.ADMIN_EMAIL || "admin@admin.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";
    const adminName = process.env.ADMIN_NAME || "Admin";

    try {
        // Check if admin already exists
        const existingAdmin = await prisma.user.findUnique({
            where: { email: adminEmail },
        });

        if (existingAdmin) {
            console.log("Admin already exists. Skipping seed.");
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // Create admin directly in DB
        await prisma.user.create({
            data: {
                name: adminName,
                email: adminEmail,
                emailVerified: true,
                role: "ADMIN",
                status: "ACTIVE",
                accounts: {
                    create: {
                        providerId: "credentials",
                        accountId: adminEmail,
                        password: hashedPassword,
                    },
                },
            },
        });

        console.log("✅ Admin user created successfully");
        console.log(`📧 Email: ${adminEmail}`);
        console.log(`🔑 Password: ${adminPassword}`);
    } catch (error) {
        console.error("❌ Error seeding admin:", error);
    }
}

seedAdmin();
