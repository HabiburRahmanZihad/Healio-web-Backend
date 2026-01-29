import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";
import { config } from "../config";

// ================================
// Mail Transporter
// ================================
const transporter = nodemailer.createTransport({
    host: config.smtp.host || "smtp.gmail.com",
    port: config.smtp.port || 587,
    secure: false,
    auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
    },
});

// ================================
// Better Auth Config
// ================================
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    trustedOrigins: config.trusted_origins,

    // 🔥🔥🔥 THIS IS THE KEY PART 🔥🔥🔥
    // HARD BLOCK ADMIN FROM PUBLIC SIGNUP
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    console.log("Creating user with data:", user);
                    if (user.role === "ADMIN" && !config.allow_admin_signup) {
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
        requireEmailVerification: false, // Temporary for debugging
    },

    // ================================
    // Email Verification
    // ================================
    emailVerification: {
        sendOnSignUp: false, // Temporary for debugging
        autoSignInAfterVerification: true,

        sendVerificationEmail: async ({ user, url }) => {
            try {
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
                console.log(`Verification email sent to ${user.email}`);
            } catch (error) {
                console.error(`Failed to send verification email to ${user.email}:`, error);
                // Don't throw - let signup succeed even if email fails
            }
        },
    },


});
