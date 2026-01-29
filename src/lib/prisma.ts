import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { PrismaClient } from '../../generated/prisma';
import { config } from '../config';

// ================================
// Database Connection Configuration
// ================================
const databaseUrl = config.database_url;

if (!databaseUrl) {
    console.error("❌ ERROR: DATABASE_URL environment variable is MISSING.");
}

// Construction of pool for the adapter
const pool = new pg.Pool({
    connectionString: databaseUrl,
    // Enable SSL if in production OR if connecting to a remote host (Render/Neon)
    ssl: config.env === "production" || databaseUrl?.includes("onrender.com") || databaseUrl?.includes("neon.tech")
        ? { rejectUnauthorized: false }
        : false
});

// Initialize Prisma Client with PostgreSQL adapter
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export { prisma };