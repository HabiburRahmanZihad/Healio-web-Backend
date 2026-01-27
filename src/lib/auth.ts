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

    // ================================
    // User extra fields (MediStore)
    // ================================
    user: {
        additionalFields: {
            role: {
                type: "string",
                default: "CUSTOMER", // ✅ matches Prisma
                required: false,
            },
            phone: {
                type: "string",
                required: false,
            },
            status: {
                type: "string",
                default: "ACTIVE",
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
            try {
                await transporter.sendMail({
                    from: `"MediStore" <no-reply@medistore.com>`,
                    to: user.email!, // ✅ dynamic user email
                    subject: "Verify your email address",
                    html: `
            <p>Hello ${user.name},</p>
            <p>Please verify your email address by clicking the link below:</p>
            <a href="${url}">Verify Email</a>
            <p>If you did not create this account, please ignore this email.</p>
            `,
                });
            } catch (error) {
                console.error("Email verification error:", error);
                throw new Error("Failed to send verification email");
            }
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
