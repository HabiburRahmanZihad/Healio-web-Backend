import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { PrismaClient } from '../../generated/prisma';

// ================================
// Database Connection Configuration
// ================================
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error("❌ ERROR: DATABASE_URL environment variable is MISSING.");
}

// Construction of pool for the adapter
const pool = new pg.Pool({
    connectionString: databaseUrl,
    // On Render/Production, SSL is often required
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

// Initialize Prisma Client with PostgreSQL adapter
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export { prisma };