import { Server } from "http";
import app from "./app";
import { prisma } from "./lib/prisma";

const PORT = process.env.PORT || 5000;
let server: Server;

async function main() {
    try {
        await prisma.$connect();
        console.log("✅ Database connection established.");

        server = app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📡 Health Check: http://localhost:${PORT}/health`);
        });

        // ================================
        // Graceful Shutdown Logic
        // ================================
        const shutdown = async (signal: string) => {
            console.log(`\n\n🛑 Received ${signal}. Starting graceful shutdown...`);

            if (server) {
                server.close(() => {
                    console.log("📡 HTTP server closed.");
                });
            }

            try {
                await prisma.$disconnect();
                console.log("🗄️ Database connection closed.");
                process.exit(0);
            } catch (err) {
                console.error("❌ Error during shutdown:", err);
                process.exit(1);
            }
        };

        process.on("SIGTERM", () => shutdown("SIGTERM"));
        process.on("SIGINT", () => shutdown("SIGINT"));

    } catch (error) {
        console.error("💥 Critical startup error:", error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

// ================================
// Process Level Error Handling
// ================================
process.on("unhandledRejection", (reason) => {
    console.error("🚨 Unhandled Rejection at:", reason);
});

process.on("uncaughtException", (error) => {
    console.error("🚨 Uncaught Exception:", error);
    process.exit(1);
});

main();