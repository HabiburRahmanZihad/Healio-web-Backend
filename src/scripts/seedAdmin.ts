import { prisma } from "../lib/prisma";
import { auth } from "../lib/auth";

async function seedAdmin() {
    console.log("******** Admin Seeding Started ********");

    const adminEmail = "admin@admin.com";
    const adminPassword = "Admin@123";

    try {
        // Check if admin already exists
        const existingAdmin = await prisma.user.findUnique({
            where: { email: adminEmail },
        });

        if (existingAdmin) {
            console.log("⚠️ Admin user already exists. Ensuring emailVerified: true...");
            await prisma.user.update({
                where: { email: adminEmail },
                data: { emailVerified: true },
            });
            return;
        }

        // Create Admin via Better Auth API to ensure password hashing works
        // We override the databaseHook by setting the env var in the command if needed
        const newAdmin = await auth.api.signUpEmail({
            body: {
                email: adminEmail,
                password: adminPassword,
                name: "MediStore Admin",
                role: "ADMIN",
                isBlocked: false,
            },
        });

        if (newAdmin) {
            // Explicitly set emailVerified to true in the database
            await prisma.user.update({
                where: { email: adminEmail },
                data: { emailVerified: true },
            });

            console.log("✅ Admin user created successfully via Better Auth API");
            console.log(`📧 Email: ${adminEmail}`);
            console.log(`🔑 Password: ${adminPassword}`);
        }
    } catch (error) {
        console.error("❌ Error seeding admin:", error);
    } finally {
        await prisma.$disconnect();
    }
}

seedAdmin();
