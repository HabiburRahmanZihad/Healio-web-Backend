import { prisma } from "../../lib/prisma";

export const CategoryService = {
    create: async (name: string) => {
        return prisma.category.create({
            data: { name },
        });
    },

    getAll: async () => {
        return prisma.category.findMany({
            orderBy: { createdAt: "desc" },
        });
    },

    delete: async (id: string) => {
        return prisma.category.delete({
            where: { id },
        });
    },
};
