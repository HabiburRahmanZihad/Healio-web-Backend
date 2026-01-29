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
const isLocal = databaseUrl?.includes("localhost") || databaseUrl?.includes("127.0.0.1");

const pool = new pg.Pool({
    connectionString: databaseUrl,
    // Enable SSL for all remote connections (Render, Neon, etc.)
    ssl: isLocal ? false : { rejectUnauthorized: false }
});

// Initialize Prisma Client with PostgreSQL adapter
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export { prisma };