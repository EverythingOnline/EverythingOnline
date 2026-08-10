import { PrismaClient } from '@prisma/client';
import { getProductById } from './productsModel.js';

const prisma = new PrismaClient();

type NewOrderItem = {
    productId: string;
    quantity: number;
};

type NewOrderPayload = {
    items: NewOrderItem[];
    customerPhone: string;
    userId?: string;
    paymentMethod?: string;
};

type ManualPaymentPayload = {
    orderId: string;
    paymentMethod: string;
    amountReceived: number;
    paymentReference?: string;
    adminId?: string;
};

type FinalizeOrderPayload = {
    orderId: string;
    adminId?: string;
};

type OrderFilters = {
    status?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    customerPhone?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
};

type OrderUpdateParams = {
    orderId: string;
    status: string;
    adminId?: string;
    reason?: string;
};

const validTransitions: Record<string, string[]> = {
    PENDING: ['PAID', 'CANCELLED'],
    PAID: ['PROCESSING', 'REFUNDED'],
    PROCESSING: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED', 'REFUNDED'],
    DELIVERED: [],
    CANCELLED: [],
    REFUNDED: [],
};

function normalizeOrderItems(items: NewOrderItem[]) {
    if (!Array.isArray(items) || items.length === 0) {
        const error = new Error('items must be a non-empty array') as Error & { status?: number };
        error.status = 400;
        throw error;
    }
    return items.map((item) => {
        if (!item.productId || typeof item.productId !== 'string') {
            const error = new Error('Each item must include a valid productId') as Error & { status?: number };
            error.status = 400;
            throw error;
        }
        if (!item.quantity || typeof item.quantity !== 'number' || item.quantity < 1) {
            const error = new Error('Each item must include a quantity greater than 0') as Error & { status?: number };
            error.status = 400;
            throw error;
        }
        return item;
    });
}

function ensureTransition(current: string, next: string) {
    if (!validTransitions[current]?.includes(next)) {
        const error = new Error(`Invalid status transition from ${current} to ${next}`) as Error & { status?: number };
        error.status = 400;
        throw error;
    }
}

async function buildOrderItems(items: NewOrderItem[]) {
    return Promise.all(
        items.map(async (item) => {
            const product = await getProductById(item.productId);
            if (!product) {
                const error = new Error(`Invalid product ID: ${item.productId}`) as Error & { status?: number };
                error.status = 400;
                throw error;
            }
            return {
                productId: item.productId,
                name: product.name,
                sku: product.slug,
                quantity: item.quantity,
                unitPrice: product.price,
                total: product.price * item.quantity,
            };
        }),
    );
}

async function createOrderStatusHistory(orderId: string, fromStatus: string, toStatus: string, adminId?: string, reason?: string) {
    return prisma.orderStatusHistory.create({
        data: {
            orderId,
            fromStatus,
            toStatus,
            changedById: adminId,
            reason,
        },
    });
}

async function getOrderWithRelations(id: string) {
    return prisma.order.findUnique({
        where: { id },
        include: {
            items: true,
            payment: true,
        },
    });
}

function calculateOrderTotals(items: { quantity: number; unitPrice: number }[], deliveryFee: number) {
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    return { subtotal, total: subtotal + deliveryFee };
}

export async function createOrder({ items, customerPhone, userId, paymentMethod = 'CASH' }: NewOrderPayload) {
    const normalizedItems = normalizeOrderItems(items);
    const orderItems = await buildOrderItems(normalizedItems);
    const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
    const deliveryFee = 0;
    const total = subtotal + deliveryFee;

    const dataAny: any = {
        customerPhone,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        paymentMethod,
        subtotal,
        deliveryFee,
        total,
        items: {
            create: orderItems,
        },
    };
    if (userId) dataAny.userId = userId;

    const order = await prisma.order.create({
        data: dataAny,
    });

    return order;
}

export async function createMultipleOrders(payload: NewOrderPayload) {
    return createOrder(payload);
}

export async function getOrders(filters: OrderFilters) {
    const where: any = {};

    if (filters.status) where.status = filters.status;
    if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;
    if (filters.paymentMethod) where.paymentMethod = filters.paymentMethod;
    if (filters.customerPhone) where.customerPhone = { contains: filters.customerPhone, mode: 'insensitive' };
    if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
        if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;

    const total = await prisma.order.count({ where });
    const orders = await prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
    });

    return { orders, total, page, pageSize };
}

export async function getOrderById(id: string) {
    return getOrderWithRelations(id);
}

export async function recordManualPayment({ orderId, paymentMethod, amountReceived, paymentReference, adminId }: ManualPaymentPayload) {
    const order = await getOrderWithRelations(orderId);
    if (!order) {
        const error = new Error('Order not found') as Error & { status?: number };
        error.status = 404;
        throw error;
    }

    if (order.paymentStatus === 'SUCCESSFUL' || order.status === 'PAID') {
        const error = new Error('Order is already marked as paid') as Error & { status?: number };
        error.status = 400;
        throw error;
    }

    const isFullyPaid = amountReceived >= order.total;
    const paymentStatus = isFullyPaid ? 'SUCCESSFUL' : 'PENDING';
    const orderData: any = {
        paymentMethod,
        paymentStatus,
    };
    if (isFullyPaid) {
        orderData.status = 'PAID';
        orderData.paidAt = new Date();
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
        const payment = await tx.payment.upsert({
            where: { orderId },
            create: {
                orderId,
                merchantRequestId: 'manual-payment',
                checkoutRequestId: 'manual-payment',
                amount: amountReceived,
                method: paymentMethod,
                reference: paymentReference,
                recordedById: adminId,
                recordedAt: new Date(),
                isManual: true,
                resultCode: isFullyPaid ? 0 : 1,
                resultDesc: isFullyPaid ? 'Manual payment recorded' : 'Partial manual payment recorded',
                status: paymentStatus,
                callbackData: JSON.stringify({ manual: true, amountReceived, reference: paymentReference }),
                rawPayload: JSON.stringify({ manual: true, amountReceived, reference: paymentReference, paymentMethod }),
            },
            update: {
                amount: amountReceived,
                method: paymentMethod,
                reference: paymentReference,
                recordedById: adminId,
                recordedAt: new Date(),
                isManual: true,
                resultCode: isFullyPaid ? 0 : 1,
                resultDesc: isFullyPaid ? 'Manual payment updated' : 'Partial manual payment updated',
                status: paymentStatus,
                callbackData: JSON.stringify({ manual: true, amountReceived, reference: paymentReference }),
                rawPayload: JSON.stringify({ manual: true, amountReceived, reference: paymentReference, paymentMethod }),
            },
        });

        const updated = await tx.order.update({
            where: { id: orderId },
            data: orderData,
            include: { items: true, payment: true },
        });

        if (isFullyPaid && order.status !== 'PAID') {
            await tx.orderStatusHistory.create({
                data: {
                    orderId,
                    fromStatus: order.status,
                    toStatus: 'PAID',
                    changedById: adminId,
                    reason: 'Manual payment recorded',
                },
            });
        }

        return updated;
    });

    return updatedOrder;
}

export async function finalizeOrderCheckout({ orderId, adminId }: FinalizeOrderPayload) {
    const order = await getOrderWithRelations(orderId);
    if (!order) {
        const error = new Error('Order not found') as Error & { status?: number };
        error.status = 404;
        throw error;
    }

    if (order.status !== 'PENDING') {
        const error = new Error('Only pending orders can be finalized') as Error & { status?: number };
        error.status = 400;
        throw error;
    }

    if (!order.items || order.items.length === 0) {
        const error = new Error('Order contains no items') as Error & { status?: number };
        error.status = 400;
        throw error;
    }

    const itemsWithProduct = await Promise.all(
        order.items.map(async (item) => {
            const product = await getProductById(item.productId);
            if (!product) {
                const error = new Error(`Invalid product ID: ${item.productId}`) as Error & { status?: number };
                error.status = 400;
                throw error;
            }
            return { item, product };
        }),
    );

    const expectedSubtotal = itemsWithProduct.reduce((sum, entry) => sum + entry.product.price * entry.item.quantity, 0);
    const expectedTotal = expectedSubtotal + order.deliveryFee;
    if (Math.abs(expectedSubtotal - order.subtotal) > 0.01 || Math.abs(expectedTotal - order.total) > 0.01) {
        const error = new Error('Order totals have changed and must be reviewed before finalizing checkout.') as Error & { status?: number };
        error.status = 400;
        throw error;
    }

    const insufficientStockItem = itemsWithProduct.find((entry) => entry.product.stock < entry.item.quantity);
    if (insufficientStockItem) {
        const error = new Error(`Product ${insufficientStockItem.product.name} is out of stock or does not have enough quantity.`) as Error & { status?: number };
        error.status = 400;
        throw error;
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
        await Promise.all(
            itemsWithProduct.map(({ item }) =>
                tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                    },
                }),
            ),
        );

        const orderUpdate = await tx.order.update({
            where: { id: orderId },
            data: {
                status: 'PAID',
                paymentStatus: 'SUCCESSFUL',
                paidAt: new Date(),
            },
            include: { items: true, payment: true },
        });

        await tx.payment.upsert({
            where: { orderId },
            create: {
                orderId,
                amount: order.total,
                method: order.paymentMethod,
                reference: 'Checkout finalized',
                recordedAt: new Date(),
                isManual: true,
                resultCode: 0,
                resultDesc: 'Checkout finalized by admin',
                status: 'SUCCESSFUL',
                callbackData: JSON.stringify({ manual: true, source: 'admin checkout' }),
                rawPayload: JSON.stringify({ manual: true, source: 'admin checkout' }),
            },
            update: {
                amount: order.total,
                method: order.paymentMethod,
                reference: 'Checkout finalized',
                recordedAt: new Date(),
                isManual: true,
                resultCode: 0,
                resultDesc: 'Checkout finalized by admin',
                status: 'SUCCESSFUL',
                callbackData: JSON.stringify({ manual: true, source: 'admin checkout' }),
                rawPayload: JSON.stringify({ manual: true, source: 'admin checkout' }),
            },
        });

        await tx.orderStatusHistory.create({
            data: {
                orderId,
                fromStatus: order.status,
                toStatus: 'PAID',
                changedById: adminId,
                reason: 'Checkout finalized by admin',
            },
        });

        return orderUpdate;
    });

    return updatedOrder;
}

export async function getOrderById(id: string) {
    return getOrderWithRelations(id);
}

export async function updateOrderStatus({ orderId, status, adminId, reason }: OrderUpdateParams) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
        const error = new Error('Order not found') as Error & { status?: number };
        error.status = 404;
        throw error;
    }
    // Best-effort validation using validTransitions map
    if (order.status && !validTransitions[order.status]?.includes(status)) {
        const err = new Error(`Invalid status transition from ${order.status} to ${status}`) as Error & { status?: number };
        err.status = 400;
        throw err;
    }

    const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status },
    });

    if (order.status !== updatedOrder.status) {
        await createOrderStatusHistory(orderId, order.status, status, adminId, reason);
    }

    return updatedOrder;
}
