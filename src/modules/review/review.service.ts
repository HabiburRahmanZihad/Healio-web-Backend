import { prisma } from "../../lib/prisma";

export const ReviewService = {
    create: async (data: {
        rating: number;
        comment: string;
        userId: string;
        medicineId: string;
    }) => {
        // Check if user has purchased this medicine
        const orders = await prisma.order.findMany({
            where: {
                customerId: data.userId,
                status: "DELIVERED",
            },
        });

        const hasPurchased = orders.some((order) => {
            const items = order.items as any[];
            return items.some((item) => item.medicineId === data.medicineId);
        });

        if (!hasPurchased) {
            throw new Error("You can only review medicines you have purchased and received.");
        }

        return prisma.review.create({
            data,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    },

    getByMedicine: async (medicineId: string) => {
        return prisma.review.findMany({
            where: { medicineId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    },
};
