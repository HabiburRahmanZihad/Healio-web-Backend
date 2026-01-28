import { prisma } from "../../lib/prisma";

export const OrderService = {
    create: async (data: {
        customerId: string;
        items: any;
        totalPrice: number;
        address: string;
    }) => {
        // Start a transaction to ensure stock reduction
        return prisma.$transaction(async (tx) => {
            // 1. Create the order
            const order = await tx.order.create({
                data,
            });

            // 2. Reduce stock for each item
            for (const item of data.items) {
                await tx.medicine.update({
                    where: { id: item.medicineId },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                    },
                });
            }

            return order;
        });
    },

    getCustomerOrders: async (customerId: string) => {
        return prisma.order.findMany({
            where: { customerId },
            orderBy: { createdAt: "desc" },
        });
    },

    getSellerOrders: async (sellerId: string) => {
        // Find medicines owned by this seller
        const sellerMedicines = await prisma.medicine.findMany({
            where: { sellerId },
            select: { id: true }
        });
        const sellerMedicineIds = sellerMedicines.map(m => m.id);

        if (sellerMedicineIds.length === 0) return [];

        // Find orders that contain at least one of these medicines
        // Note: In a production app, you might want to only return the items belonging to the seller,
        // but here we return the whole order if it contains their medicine.
        const orders = await prisma.order.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                customer: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        // Filter in memory because of Json structure (items)
        return orders.filter(order => {
            const items = order.items as any[];
            return items.some(item => sellerMedicineIds.includes(item.medicineId));
        });
    },

    getAdminOrders: async () => {
        return prisma.order.findMany({
            include: {
                customer: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    },

    getById: async (id: string) => {
        return prisma.order.findUnique({
            where: { id },
            include: {
                customer: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    },

    updateStatus: async (id: string, status: string) => {
        return prisma.order.update({
            where: { id },
            data: { status },
        });
    },

    updateSellerOrderStatus: async (id: string, status: string, sellerId: string) => {
        // 1. Get the order
        const order = await prisma.order.findUnique({
            where: { id }
        });

        if (!order) throw new Error("Order not found");

        // 2. Verify visibility: Does the order contain items from this seller?
        const sellerMedicines = await prisma.medicine.findMany({
            where: { sellerId },
            select: { id: true }
        });
        const sellerMedicineIds = sellerMedicines.map(m => m.id);
        const items = order.items as any[];
        const hasOwnership = items.some(item => sellerMedicineIds.includes(item.medicineId));

        if (!hasOwnership) {
            throw new Error("Unauthorized to update this order");
        }

        // 3. Update status
        return prisma.order.update({
            where: { id },
            data: { status },
        });
    },

    getSellerStats: async (sellerId: string) => {
        const medicines = await prisma.medicine.findMany({
            where: { sellerId },
            select: { id: true },
        });
        const medicineIds = medicines.map((m) => m.id);

        const allOrders = await prisma.order.findMany({
            where: { status: "DELIVERED" },
        });

        const sellerOrders = allOrders.filter((order) => {
            const items = order.items as any[];
            return items.some((item) => medicineIds.includes(item.medicineId));
        });

        const totalRevenue = sellerOrders.reduce((acc, order) => acc + order.totalPrice, 0);

        return {
            totalMedicines: medicines.length,
            totalOrders: sellerOrders.length,
            revenue: totalRevenue,
        };
    },

    cancelOrder: async (id: string, customerId: string) => {
        return prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id },
            });

            if (!order || order.customerId !== customerId) {
                throw new Error("Order not found or unauthorized");
            }

            if (order.status !== "PLACED") {
                throw new Error("Only orders in 'PLACED' status can be cancelled");
            }

            // 1. Update status
            const updatedOrder = await tx.order.update({
                where: { id },
                data: { status: "CANCELLED" },
            });

            // 2. Restore stock
            const items = order.items as any[];
            for (const item of items) {
                await tx.medicine.update({
                    where: { id: item.medicineId },
                    data: {
                        stock: {
                            increment: item.quantity,
                        },
                    },
                });
            }

            return updatedOrder;
        });
    },
};
