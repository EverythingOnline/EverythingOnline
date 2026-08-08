import type { Request, Response, NextFunction } from 'express';
import { createNewOrder, createMultipleOrders } from '../models/ordersModel.js';

function emitEvent(req: Request, event: string, payload: any) {
    try {
        const io = req.app.get('io');
        if (io) io.emit(event, payload);
    } catch (err) {
        // non-fatal
        console.error('Failed to emit socket event', err);
    }
}

export async function createOrder(req: Request, res: Response, next: NextFunction) {
    try {
        const { productId, quantity, customerPhone } = req.body;
        const order = await createNewOrder({ productId, quantity, customerPhone });
        emitEvent(req, 'order.created', order);
        res.status(201).json({ data: order });
    } catch (error) {
        next(error);
    }
}

export async function createBulkOrders(req: Request, res: Response, next: NextFunction) {
    try {
        const { items, customerPhone } = req.body;
        const orders = await createMultipleOrders({ items, customerPhone });
        emitEvent(req, 'order.created.bulk', orders);
        res.status(201).json({ data: orders });
    } catch (error) {
        next(error);
    }
}
