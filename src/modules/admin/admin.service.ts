import { prisma } from "../../lib/prisma";

export const AdminService = {
    getAllUsers: async () => {
        return prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isBlocked: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        });
    },

    updateUserStatus: async (id: string, isBlocked: boolean) => {
        return prisma.user.update({
            where: { id },
            data: { isBlocked },
        });
    },

    getDashboardStats: async () => {
        const [userCount, medicineCount, orderCount, totalRevenue] = await Promise.all([
            prisma.user.count(),
            prisma.medicine.count(),
            prisma.order.count(),
            prisma.order.aggregate({
                _sum: { totalPrice: true },
            }),
        ]);

        return {
            users: userCount,
            medicines: medicineCount,
            orders: orderCount,
            revenue: totalRevenue._sum.totalPrice || 0,
        };
    },
};
