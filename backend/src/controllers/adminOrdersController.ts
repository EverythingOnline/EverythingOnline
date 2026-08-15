import type { Request, Response, NextFunction } from 'express';
import { getOrders, getOrderById, updateOrderStatus, recordManualPayment, finalizeOrderCheckout } from '../models/ordersModel.js';

const allowedStatuses = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
const allowedPaymentStatus = ['UNPAID', 'PENDING', 'SUCCESSFUL', 'FAILED', 'TIMED_OUT', 'RECONCILED'];
const allowedPaymentMethods = ['CASH', 'BANK_TRANSFER', 'MPESA_TILL', 'MPESA', 'CARD', 'OTHER'];

function isValidEnum(value: string | undefined, allowed: string[]) {
    return typeof value === 'string' && allowed.includes(value);
}

export async function listOrders(req: Request, res: Response, next: NextFunction) {
    try {
        const allowedStatuses = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
        const allowedPaymentStatus = ['UNPAID', 'PENDING', 'SUCCESSFUL', 'FAILED', 'TIMED_OUT', 'RECONCILED'];
        const allowedPaymentMethods = ['CASH', 'MPESA', 'CARD', 'OTHER'];

        const status = isValidEnum(req.query.status as string | undefined, allowedStatuses) ? (req.query.status as string) : undefined;
        const paymentStatus = isValidEnum(req.query.paymentStatus as string | undefined, allowedPaymentStatus)
            ? (req.query.paymentStatus as string)
            : undefined;
        const paymentMethod = isValidEnum(req.query.paymentMethod as string | undefined, allowedPaymentMethods)
            ? (req.query.paymentMethod as string)
            : undefined;
        const page = Number(req.query.page ?? 1);
        const pageSize = Math.min(Number(req.query.pageSize ?? 20), 100);
        const customerPhone = typeof req.query.customerPhone === 'string' ? req.query.customerPhone : undefined;
        const startDate = typeof req.query.startDate === 'string' ? req.query.startDate : undefined;
        const endDate = typeof req.query.endDate === 'string' ? req.query.endDate : undefined;

        const result = await getOrders({ status, paymentStatus, paymentMethod, customerPhone, startDate, endDate, page, pageSize });

        res.json({ data: result.orders, meta: { total: result.total, page: result.page, pageSize: result.pageSize } });
    } catch (error) {
        next(error);
    }
}

export async function getOrder(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const order = await getOrderById(id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json({ data: order });
    } catch (error) {
        next(error);
    }
}

function emitEvent(req: Request, event: string, payload: unknown) {
    try {
        const io = req.app.get('io');
        if (io) io.emit(event, payload);
    } catch (err) {
        console.error('Failed to emit socket event', err);
    }
}

export async function updateOrderStatusHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const { status, reason } = req.body;
        if (!status || !isValidEnum(status, allowedStatuses)) {
            return res.status(400).json({ error: 'Invalid order status' });
        }

        const updatedOrder = await updateOrderStatus({ orderId: id, status, adminId: (req as Request & { user?: { id?: string } }).user?.id, reason });
        emitEvent(req, 'order.updated', updatedOrder);
        res.json({ data: updatedOrder });
    } catch (error) {
        next(error);
    }
}

export async function recordManualPaymentHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const { paymentMethod, amountReceived, paymentReference } = req.body;

        if (!paymentMethod || !isValidEnum(paymentMethod, allowedPaymentMethods)) {
            return res.status(400).json({ error: 'Invalid payment method' });
        }

        const updatedOrder = await recordManualPayment({
            orderId: id,
            paymentMethod,
            amountReceived: Number(amountReceived ?? 0),
            paymentReference,
            adminId: (req as Request & { user?: { id?: string } }).user?.id,
        });

        emitEvent(req, 'payment.received', updatedOrder);
        emitEvent(req, 'order.updated', updatedOrder);
        res.json({ data: updatedOrder });
    } catch (error) {
        next(error);
    }
}

export async function finalizeOrderCheckoutHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const updatedOrder = await finalizeOrderCheckout({
            orderId: id,
            adminId: (req as Request & { user?: { id?: string } }).user?.id,
        });
        emitEvent(req, 'order.updated', updatedOrder);
        res.json({ data: updatedOrder });
    } catch (error) {
        next(error);
    }
}
