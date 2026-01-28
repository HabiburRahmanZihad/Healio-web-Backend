import { prisma } from "../../lib/prisma";

interface IBaseMedicine {
    name: string;
    description: string;
    price: number;
    stock: number;
    image: string;
    manufacturer: string;
    categoryId: string;
}

export const MedicineService = {
    create: async (data: IBaseMedicine & { sellerId: string }) => {
        return prisma.medicine.create({
            data,
        });
    },

    getAll: async (filter: {
        search?: string | undefined;
        category?: string | undefined;
        manufacturer?: string | undefined;
        minPrice?: number | undefined;
        maxPrice?: number | undefined;
    }) => {
        const { search, category, manufacturer, minPrice, maxPrice } = filter;

        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { manufacturer: { contains: search, mode: "insensitive" } },
            ];
        }

        if (category) {
            where.category = { name: { contains: category, mode: "insensitive" } };
        }

        if (manufacturer) {
            where.manufacturer = { contains: manufacturer, mode: "insensitive" };
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {
                gte: minPrice,
                lte: maxPrice,
            };
        }

        return prisma.medicine.findMany({
            where,
            include: {
                category: true,
                seller: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    },

    getById: async (id: string) => {
        const medicine = await prisma.medicine.findUnique({
            where: { id },
            include: {
                category: true,
                seller: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                reviews: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        if (!medicine) return null;

        const totalReviews = medicine.reviews.length;
        const averageRating =
            totalReviews > 0
                ? medicine.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / totalReviews
                : 0;

        return {
            ...medicine,
            averageRating,
            totalReviews,
        };
    },

    update: async (
        id: string,
        sellerId: string,
        data: Partial<IBaseMedicine>
    ) => {
        // First check ownership
        const existing = await prisma.medicine.findUnique({
            where: { id },
        });

        if (!existing || existing.sellerId !== sellerId) {
            throw new Error("Medicine not found or unauthorized");
        }

        return prisma.medicine.update({
            where: { id },
            data,
        });
    },

    delete: async (id: string, sellerId: string) => {
        // First check ownership
        const existing = await prisma.medicine.findUnique({
            where: { id },
        });

        if (!existing || existing.sellerId !== sellerId) {
            throw new Error("Medicine not found or unauthorized");
        }

        return prisma.medicine.delete({
            where: { id },
        });
    },
};
