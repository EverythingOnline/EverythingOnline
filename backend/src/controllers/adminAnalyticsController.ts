import type { NextFunction, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const paidOrderWhere = {
    OR: [{ paymentStatus: 'SUCCESSFUL' }, { status: 'PAID' }],
};

type ProductStockAlert = {
    id: string;
    name: string;
    stock: number;
    lowStockThreshold: number;
};

export async function getLowStock(req: Request, res: Response, next: NextFunction) {
    try {
        const products: ProductStockAlert[] = await prisma.product.findMany({
            where: { stock: { gt: 0 }, active: true },
            select: { id: true, name: true, stock: true, lowStockThreshold: true },
        });
        res.json({
            data: products
                .filter((product: ProductStockAlert) => product.stock <= product.lowStockThreshold)
                .sort((a: ProductStockAlert, b: ProductStockAlert) => a.stock - b.stock),
        });
    } catch (error) {
        next(error);
    }
}

export async function getOutOfStock(req: Request, res: Response, next: NextFunction) {
    try {
        const products = await prisma.product.findMany({
            where: { stock: 0, active: true },
            select: { id: true, name: true, stock: true, lowStockThreshold: true },
            orderBy: { name: 'asc' },
        });
        res.json({ data: products });
    } catch (error) {
        next(error);
    }
}

export async function getTopSelling(req: Request, res: Response, next: NextFunction) {
    try {
        const window = req.query.window === '30d' ? 30 : req.query.window === 'all' ? null : 7;
        const createdAt = window ? { gte: new Date(Date.now() - window * 24 * 60 * 60 * 1000) } : undefined;
        const items = await prisma.orderItem.findMany({
            where: { order: { ...paidOrderWhere, ...(createdAt ? { createdAt } : {}) } },
            select: { productId: true, name: true, quantity: true },
        });
        const totals = new Map<string, { id: string; name: string; quantitySold: number }>();
        for (const item of items) {
            const current = totals.get(item.productId) ?? { id: item.productId, name: item.name, quantitySold: 0 };
            current.quantitySold += item.quantity;
            totals.set(item.productId, current);
        }
        res.json({ data: Array.from(totals.values()).sort((a, b) => b.quantitySold - a.quantitySold).slice(0, 10), window: req.query.window === '30d' || req.query.window === 'all' ? req.query.window : '7d' });
    } catch (error) {
        next(error);
    }
}

export async function getRevenue(req: Request, res: Response, next: NextFunction) {
    try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const week = new Date(today);
        week.setDate(today.getDate() - today.getDay());
        const month = new Date(now.getFullYear(), now.getMonth(), 1);
        const orders = await prisma.order.findMany({ where: paidOrderWhere, select: { total: true, createdAt: true } });
        const sumSince = (start: Date) => orders.filter((order) => order.createdAt >= start).reduce((sum, order) => sum + order.total, 0);
        res.json({ data: { today: sumSince(today), thisWeek: sumSince(week), thisMonth: sumSince(month) } });
    } catch (error) {
        next(error);
    }
}