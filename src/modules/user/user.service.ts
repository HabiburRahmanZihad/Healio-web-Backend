import { prisma } from "../../lib/prisma";

export const UserService = {
    getProfile: async (id: string) => {
        return prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isBlocked: true,
                image: true,
                phone: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    },

    updateProfile: async (id: string, data: { name?: string; image?: string; phone?: string }) => {
        return prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isBlocked: true,
                image: true,
                phone: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    },
};
