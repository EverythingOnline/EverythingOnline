import type { Request, Response, NextFunction } from 'express';
import * as paymentsModel from '../models/paymentsModel.js';
import { finalizeOrderPayment } from '../models/ordersModel.js';

export async function listPendingPayments(req: Request, res: Response, next: NextFunction) {
    try {
        const method = req.query.method as string | undefined;
        const payments = await paymentsModel.getPendingPaymentsForAdmin({ method });
        res.json({ data: payments });
    } catch (err) {
        next(err);
    }
}

export async function approvePayment(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const adminId = (req as any).user?.id as string | undefined;
        if (!adminId) return res.status(403).json({ error: 'admin required' });

        const payment = await paymentsModel.approvePayment(String(id), String(adminId));
        // finalize order
        await finalizeOrderPayment({ orderId: payment.orderId, paymentId: payment.id, reference: payment.reference ?? undefined });

        // emit socket event if available
        try { const io = req.app.get('io'); if (io) io.emit('payment:approved', { paymentId: payment.id, orderId: payment.orderId }); } catch (e) { }

        res.json({ data: payment });
    } catch (err) {
        next(err);
    }
}

export async function rejectPayment(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const adminId = (req as any).user?.id as string | undefined;
        if (!adminId) return res.status(403).json({ error: 'admin required' });
        const { note } = req.body;
        const payment = await paymentsModel.rejectPayment(String(id), String(adminId), note);

        try { const io = req.app.get('io'); if (io) io.emit('payment:rejected', { paymentId: payment.id, orderId: payment.orderId }); } catch (e) { }

        res.json({ data: payment });
    } catch (err) {
        next(err);
    }
}
