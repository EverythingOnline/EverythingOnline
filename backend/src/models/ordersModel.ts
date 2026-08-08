import { PrismaClient } from '@prisma/client';
import { getProductById } from './productsModel.js';

const prisma = new PrismaClient();

export async function createNewOrder({ productId, quantity, customerPhone }: { productId: string; quantity: number; customerPhone: string }) {
    const product = await getProductById(productId);
    if (!product) {
        const error = new Error('Invalid product ID') as Error & { status?: number };
        error.status = 400;
        throw error;
    }
    const order = await prisma.order.create({
        data: {
            productId,
            customerPhone,
            status: 'PENDING',
            items: JSON.stringify([{ productId, quantity }]),
            subtotal: product.price * quantity,
            deliveryFee: 0,
            total: product.price * quantity,
            paymentStatus: 'unpaid',
            paymentMethod: 'cash',
        },
    });
    return order;
}

export async function createMultipleOrders({ items, customerPhone }: { items: { productId: string; quantity: number }[]; customerPhone: string }) {
    if (!Array.isArray(items) || items.length === 0) {
        const error = new Error('items must be a non-empty array') as Error & { status?: number };
        error.status = 400;
        throw error;
    }

    const creations = [] as any[];

    for (const item of items) {
        const product = await getProductById(item.productId);
        if (!product) {
            const error = new Error(`Invalid product ID: ${item.productId}`) as Error & { status?: number };
            error.status = 400;
            throw error;
        }

        creations.push({
            productId: item.productId,
            customerPhone,
            status: 'PENDING',
            paymentStatus: 'unpaid',
            paymentMethod: 'cash',
            items: JSON.stringify([{ productId: item.productId, quantity: item.quantity }]),
            subtotal: product.price * item.quantity,
            deliveryFee: 0,
            total: product.price * item.quantity,
        });
    }

    const orders = await prisma.$transaction(creations.map((data) => prisma.order.create({ data })));
    return orders;
}

export async function getOrders(status?: string) {
    const where = status ? { status } : undefined;
    const orders = await prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
    });
    return orders;
}
