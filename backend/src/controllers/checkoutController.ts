import type { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createMpesaPayment, markPaymentExpired, findPaymentByCheckoutRequestId, createManualPayment } from '../models/paymentsModel.js';
import { createMultipleOrders, finalizeOrderPayment, getOrderById } from '../models/ordersModel.js';
import { normalizeMpesaPhone, sendTillStkPush } from '../services/mpesa.js';

const prisma = new PrismaClient();

function checkoutError(message: string, status = 400) {
    const error = new Error(message) as Error & { status?: number };
    error.status = status;
    return error;
}

export async function createCheckoutDraft(req: Request, res: Response, next: NextFunction) {
    try {
        const { items, customerPhone, deliveryFee, shippingMethod, contact, paymentMethod } = req.body;
        if (!Array.isArray(items) || items.length === 0) throw checkoutError('Cart items are required');
        const order = await createMultipleOrders({ items, customerPhone: customerPhone || '', deliveryFee: Number(deliveryFee ?? 0), shippingMethod, contact, paymentMethod });
        res.status(201).json({ data: order });
    } catch (error) { next(error); }
}

export async function updateCheckoutShipping(req: Request, res: Response, next: NextFunction) {
    try {
        const orderId = String(req.params.orderId);
        const { shippingMethod, deliveryFee } = req.body;
        if (!shippingMethod || Number.isNaN(Number(deliveryFee))) throw checkoutError('Shipping method and fee are required');
        const order = await getOrderById(orderId);
        if (!order) throw checkoutError('Order not found', 404);
        const updated = await prisma.order.update({ where: { id: orderId }, data: { shippingMethod, deliveryFee: Number(deliveryFee), total: order.subtotal + Number(deliveryFee) }, include: { items: true } });
        res.json({ data: updated });
    } catch (error) { next(error); }
}

export async function updateCheckoutContact(req: Request, res: Response, next: NextFunction) {
    try {
        const orderId = String(req.params.orderId);
        const { firstName, lastName, email, phone, address, city, county, notes } = req.body;
        if (!firstName || !lastName || !phone) throw checkoutError('First name, last name, and phone are required');
        const updated = await prisma.order.update({ where: { id: orderId }, data: { customerFirstName: firstName, customerLastName: lastName, customerEmail: email || null, customerPhone: phone, deliveryAddress: address || null, deliveryCity: city || null, deliveryCounty: county || null, deliveryNotes: notes || null }, include: { items: true } });
        res.json({ data: updated });
    } catch (error) { next(error); }
}

export async function finalizeCheckout(req: Request, res: Response, next: NextFunction) {
    try {
        const order = await getOrderById(String(req.params.orderId));
        if (!order) throw checkoutError('Order not found', 404);
        if (!order.customerFirstName || !order.customerPhone || !order.shippingMethod) throw checkoutError('Checkout details are incomplete');
        res.json({ data: order });
    } catch (error) { next(error); }
}

export async function initiateMpesa(req: Request, res: Response, next: NextFunction) {
    try {
        const { orderId, phoneNumber } = req.body;
        if (!orderId || !phoneNumber) return res.status(400).json({ error: 'orderId and phoneNumber required' });

        const order = await getOrderById(String(orderId));
        if (!order) {
            return res.status(404).json({ error: 'Order not found. Create the order before starting M-Pesa checkout.' });
        }

        const normalizedPhone = normalizeMpesaPhone(String(phoneNumber));
        const amount = Number(order.total);
        const { response, data } = await sendTillStkPush({ orderId: String(orderId), phoneNumber: normalizedPhone, amount });

        if (response.ok && data?.CheckoutRequestID) {
            await createMpesaPayment({ orderId: String(orderId), amount, checkoutRequestId: data.CheckoutRequestID, rawPayload: JSON.stringify(data) });
            await prisma.order.update({ where: { id: String(orderId) }, data: { mpesaCheckoutRequestId: data.CheckoutRequestID, paymentMethod: 'MPESA_TILL', customerPhone: normalizedPhone } });
        }

        res.status(response.status).json(data);
    } catch (err) {
        next(err);
    }
}

export async function mpesaCallback(req: Request, res: Response, next: NextFunction) {
    try {
        const body = req.body;
        const stkCallback = body?.Body?.stkCallback;
        if (!stkCallback) {
            return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
        }

        const checkoutRequestId = String(stkCallback.CheckoutRequestID ?? '');
        if (!checkoutRequestId) {
            return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
        }

        const orderForCallback = await prisma.order.findUnique({
            where: { mpesaCheckoutRequestId: checkoutRequestId },
            include: { payments: true },
        });
        const payment = orderForCallback?.payments.find((item) => item.checkoutRequestId === checkoutRequestId)
            ?? await findPaymentByCheckoutRequestId(checkoutRequestId as any);
        if (!payment) {
            const details = {
                checkoutRequestId,
                merchantRequestId: stkCallback.MerchantRequestID ?? null,
                resultCode: stkCallback.ResultCode ?? null,
                resultDesc: stkCallback.ResultDesc ?? null,
                callbackMetadata: stkCallback.CallbackMetadata ?? null,
            };
            // eslint-disable-next-line no-console
            console.warn('Received M-Pesa callback without matching payment record:', details);
            return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
        }

        if (payment.status === 'CONFIRMED' || payment.status === 'FAILED') {
            return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
        }

        const resultCode = Number(stkCallback.ResultCode);
        if (resultCode === 0) {
            const metadata = stkCallback.CallbackMetadata?.Item || [];
            const receipt = metadata.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value ?? null;
            const callbackAmount = metadata.find((i: any) => i.Name === 'Amount')?.Value;
            await prisma.order.update({ where: { id: payment.orderId }, data: { mpesaReceiptNumber: receipt ? String(receipt) : null, mpesaResultDesc: stkCallback.ResultDesc ?? null } });
            await prisma.payment.update({
                where: { id: payment.id },
                data: {
                    amount: callbackAmount === undefined ? payment.amount : Number(callbackAmount),
                    merchantRequestId: stkCallback.MerchantRequestID ?? null,
                    callbackData: JSON.stringify(stkCallback),
                },
            });
            await finalizeOrderPayment({ orderId: payment.orderId, paymentId: payment.id, reference: receipt, resultCode: stkCallback.ResultCode, resultDesc: stkCallback.ResultDesc });
            try { const io = req.app.get('io'); if (io) io.emit('payment:confirmed', { orderId: payment.orderId, paymentId: payment.id }); } catch (e) { }
            return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
        }

        await markPaymentExpired(payment.id, 'FAILED', resultCode, stkCallback.ResultDesc);
        await prisma.order.update({ where: { id: payment.orderId }, data: { paymentStatus: 'FAILED', mpesaResultDesc: stkCallback.ResultDesc ?? null } });
        return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
    } catch (err) {
        // Safaricom expects an acknowledgment even when local processing fails.
        console.error('M-Pesa callback processing failed', err);
        res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }
}

export async function manualPaymentHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const { orderId, method, reference, amount } = req.body;
        if (!orderId || !method) return res.status(400).json({ error: 'orderId and method required' });
        const order = await getOrderById(String(orderId));
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const payment = await createManualPayment({ orderId, method, reference, amount: Number(amount ?? 0) });
        try {
            const io = req.app.get('io');
            if (io) io.emit('payment.received', { orderId, paymentId: payment.id });
        } catch {
            // ignore socket errors
        }
        res.status(201).json({ data: payment });
    } catch (err) {
        next(err);
    }
}

export async function getPaymentStatus(req: Request, res: Response, next: NextFunction) {
    try {
        const orderId = String(req.params.orderId);
        const order = await getOrderById(orderId);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        const payment = order.payments?.find((item: any) => item.method === 'MPESA_DARAJA') ?? order.payments?.[order.payments.length - 1];
        const status = order.paymentStatus === 'SUCCESSFUL' || order.status === 'PAID'
            ? 'paid'
            : payment?.status === 'FAILED' || order.paymentStatus === 'FAILED'
                ? 'failed'
                : 'pending';
        res.json({ data: { status, reference: payment?.reference ?? order.mpesaReceiptNumber ?? null, reason: payment?.resultDesc ?? order.mpesaResultDesc ?? null } });
    } catch (err) {
        next(err);
    }
}
