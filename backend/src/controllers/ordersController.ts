import type { Request, Response, NextFunction } from 'express';
import { createOrder as createOrderRecord, createMultipleOrders } from '../models/ordersModel.js';

function emitEvent(req: Request, event: string, payload: unknown) {
    try {
        const io = req.app.get('io');
        if (io) io.emit(event, payload);
    } catch (err) {
        console.error('Failed to emit socket event', err);
    }
}

export async function createOrder(req: Request, res: Response, next: NextFunction) {
    try {
        const { productId, quantity, items, customerPhone, userId, paymentMethod, deliveryFee, shippingMethod, contact } = req.body;
        const orderItems =
            Array.isArray(items) && items.length > 0
                ? items
                : [{ productId: String(productId), quantity: Number(quantity) }];
        const order = await createOrderRecord({ items: orderItems, customerPhone, userId, paymentMethod, deliveryFee, shippingMethod, contact });
        emitEvent(req, 'order.created', order);
        res.status(201).json({ data: order });
    } catch (error) {
        next(error);
    }
}

export async function createBulkOrders(req: Request, res: Response, next: NextFunction) {
    try {
        const { items, customerPhone, userId, paymentMethod, deliveryFee, shippingMethod, contact } = req.body;
        const order = await createMultipleOrders({ items, customerPhone, userId, paymentMethod, deliveryFee, shippingMethod, contact });
        emitEvent(req, 'order.created.bulk', order);
        res.status(201).json({ data: order });
    } catch (error) {
        next(error);
    }
}
