import { prisma } from "../../lib/prisma";

export const OrderService = {
    create: async (data: {
        customerId: string;
        items: any;
        totalPrice: number;
        address: string;
    }) => {
        // Start a transaction to ensure stock reduction
        return prisma.$transaction(async (tx: any) => {
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

    getCustomerOrders: async (customerId: string, filter: { page?: number; limit?: number } = {}) => {
        const { page = 1, limit = 10 } = filter;
        const skip = (page - 1) * limit;
        const take = limit;

        const where = { customerId };

        const [data, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    customer: {
                        select: { id: true, name: true, email: true },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take,
            }),
            prisma.order.count({ where }),
        ]);

        return {
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
            data,
        };
    },

    getSellerOrders: async (sellerId: string, filter: { search?: string; page?: number; limit?: number } = {}) => {
        const { search, page = 1, limit = 10 } = filter;
        const skip = (page - 1) * limit;
        const take = limit;

        // Find medicines owned by this seller
        const sellerMedicines = await prisma.medicine.findMany({
            where: { sellerId },
            select: { id: true }
        });
        const sellerMedicineIds = sellerMedicines.map((m: any) => m.id);

        if (sellerMedicineIds.length === 0) return { meta: { page, limit, total: 0, totalPages: 0 }, data: [] };

        const where: any = {};
        if (search) {
            where.OR = [
                { id: { contains: search, mode: "insensitive" } },
                { customer: { name: { contains: search, mode: "insensitive" } } },
                { customer: { email: { contains: search, mode: "insensitive" } } },
            ];
        }

        // Complex filter: Order must contain seller's medicine
        // Since "items" is JSON, we can't easily filter in SQL for "contains any of these medicineIds"
        // However, we can use the "items" field with path-based filtering if supported, 
        // but for simplicity and compatibility, we'll fetch all and filter, or use a better schema.
        // Given the constraints, I'll stick to a slightly more efficient fetch if possible.

        // For now, let's fetch orders that match the search first
        const orders = await prisma.order.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: {
                customer: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        // Filter by seller ownership
        const sellerOrders = orders.filter((order: any) => {
            const items = order.items as any[];
            return items.some((item: any) => sellerMedicineIds.includes(item.medicineId));
        });

        const total = sellerOrders.length;
        const paginatedData = sellerOrders.slice(skip, skip + take);

        // Populate medicine details
        const populatedData = await Promise.all(paginatedData.map(async (order: any) => {
            const items = order.items as any[];
            const populatedItems = await Promise.all(items.map(async (item: any) => {
                const medicine = await prisma.medicine.findUnique({
                    where: { id: item.medicineId },
                    select: { name: true, image: true }
                });
                return { ...item, medicine };
            }));
            return { ...order, items: populatedItems };
        }));

        return {
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
            data: populatedData,
        };
    },

    getAdminOrders: async (filter: { search?: string; page?: number; limit?: number } = {}) => {
        const { search, page = 1, limit = 10 } = filter;
        const skip = (page - 1) * limit;
        const take = limit;

        const where: any = {};

        if (search) {
            where.OR = [
                { id: { contains: search, mode: "insensitive" } },
                { customer: { name: { contains: search, mode: "insensitive" } } },
                { customer: { email: { contains: search, mode: "insensitive" } } },
            ];
        }

        const [data, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    customer: {
                        select: { id: true, name: true, email: true },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take,
            }),
            prisma.order.count({ where }),
        ]);

        return {
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
            data,
        };
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
        const sellerMedicineIds = sellerMedicines.map((m: any) => m.id);
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
        const medicineIds = medicines.map((m: any) => m.id);

        const allOrders = await prisma.order.findMany({
            where: { status: "DELIVERED" },
        });

        const sellerOrders = allOrders.filter((order: any) => {
            const items = order.items as any[];
            return items.some((item: any) => medicineIds.includes(item.medicineId));
        });

        const totalRevenue = sellerOrders.reduce((acc: number, order: any) => acc + order.totalPrice, 0);

        return {
            totalMedicines: medicines.length,
            totalOrders: sellerOrders.length,
            revenue: totalRevenue,
        };
    },

    cancelOrder: async (id: string, customerId: string) => {
        return prisma.$transaction(async (tx: any) => {
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
