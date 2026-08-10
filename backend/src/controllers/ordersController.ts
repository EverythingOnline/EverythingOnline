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
        const { items, customerPhone, userId, paymentMethod } = req.body;
        const order = await createOrderRecord({ items, customerPhone, userId, paymentMethod });
        emitEvent(req, 'order.created', order);
        res.status(201).json({ data: order });
    } catch (error) {
        next(error);
    }
}

export async function createBulkOrders(req: Request, res: Response, next: NextFunction) {
    try {
        const { items, customerPhone, userId, paymentMethod } = req.body;
        const order = await createMultipleOrders({ items, customerPhone, userId, paymentMethod });
        emitEvent(req, 'order.created.bulk', order);
        res.status(201).json({ data: order });
    } catch (error) {
        next(error);
    }
}
