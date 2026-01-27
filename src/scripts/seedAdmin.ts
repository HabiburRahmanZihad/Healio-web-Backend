import "dotenv/config";
import { prisma } from "../lib/prisma";
import { auth } from "../lib/auth";

async function seedAdmin() {
    console.log("******** Admin Seeding Started ********");

    const adminEmail = process.env.ADMIN_EMAIL || "admin@admin.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";
    const adminName = process.env.ADMIN_NAME || "Admin User";

    try {
        // Check if admin already exists
        const existingAdmin = await prisma.user.findUnique({
            where: { email: adminEmail },
        });

        // DELETE existing admin to ensure fresh start (cleanup previous bad data)
        if (existingAdmin) {
            console.log("Admin already exists. Deleting for fresh seed...");
            await prisma.user.delete({
                where: { email: adminEmail },
            });
        }

        // Create admin using Better Auth API to ensure correct hashing/account setup
        // Note: Using signUpEmail will trigger verification emails if enabled,
        // so we manually mark it as verified afterwards.
        await auth.api.signUpEmail({
            body: {
                email: adminEmail,
                password: adminPassword,
                name: adminName,
                role: "ADMIN",
                status: "ACTIVE",
            }
        });

        // Manually mark as verified
        await prisma.user.update({
            where: { email: adminEmail },
            data: { emailVerified: true }
        });

        console.log("✅ Admin user created successfully via Better Auth API");
        console.log(`📧 Email: ${adminEmail}`);
        console.log(`🔑 Password: ${adminPassword}`);
    } catch (error) {
        console.error("❌ Error seeding admin:", error);
    }
}

seedAdmin();
