import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export const config = {
    env: process.env.NODE_ENV || "development",
    port: Number(process.env.PORT) || 5000,
    database_url: process.env.DATABASE_URL,
    better_auth: {
        secret: process.env.BETTER_AUTH_SECRET,
        url: process.env.BETTER_AUTH_URL,
    },
    app_url: process.env.APP_URL || "http://localhost:3000",
    smtp: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    google: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
    },
    allow_admin_signup: process.env.ALLOW_ADMIN_SIGNUP === "true",
};

// Simple validation to warn if critical variables are missing
const criticalVars = ["DATABASE_URL", "BETTER_AUTH_SECRET"];
criticalVars.forEach((varName) => {
    if (!process.env[varName] && config.env === "production") {
        console.warn(`⚠️ Warning: Environment variable ${varName} is missing in production!`);
    }
});
