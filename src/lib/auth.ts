import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

// ================================
// Mail Transporter
// ================================
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// ================================
// Better Auth Config
// ================================
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    trustedOrigins: [process.env.APP_URL!],

    // 🔥🔥🔥 THIS IS THE KEY PART 🔥🔥🔥
    // HARD BLOCK ADMIN FROM PUBLIC SIGNUP
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    if (user.role === "ADMIN" && process.env.ALLOW_ADMIN_SIGNUP !== "true") {
                        throw new Error("ADMIN signup is not allowed");
                    }

                    // extra safety: force default
                    if (!user.role) {
                        user.role = "CUSTOMER";
                    }

                    return {
                        data: user,
                    };
                },
            },
        },
    },

    // ================================
    // User extra fields
    // ================================
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
            },

            phone: {
                type: "string",
                required: false,
            },

            isBlocked: {
                type: "boolean",
                required: false,
            },
        },
    },

    // ================================
    // Email + Password Auth
    // ================================
    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        requireEmailVerification: true,
    },

    // ================================
    // Email Verification
    // ================================
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,

        sendVerificationEmail: async ({ user, url }) => {
            await transporter.sendMail({
                from: `"Healio" <no-reply@healio.com>`,
                to: user.email!,
                subject: "Verify your email address",
                html: `
            <p>Hello ${user.name},</p>
            <p>Please verify your email address:</p>
            <a href="${url}">Verify Email</a>
        `,
            });
        },
    },

    // ================================
    // Social Login
    // ================================
    socialProviders: {
        google: {
            prompt: "select_account consent",
            accessType: "offline",
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    },
});
