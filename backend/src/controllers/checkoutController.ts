import type { Request, Response, NextFunction } from 'express';
import fetch from 'node-fetch';
import { createMpesaPayment, markPaymentExpired, findPaymentByCheckoutRequestId, createManualPayment } from '../models/paymentsModel.js';
import { finalizeOrderPayment } from '../models/ordersModel.js';

const MPESA_BASE_URL = process.env.MPESA_ENVIRONMENT === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';

export async function initiateMpesa(req: Request, res: Response, next: NextFunction) {
    try {
        const { orderId, phoneNumber } = req.body;
        if (!orderId || !phoneNumber) return res.status(400).json({ error: 'orderId and phoneNumber required' });

        const consumerKey = process.env.MPESA_CONSUMER_KEY;
        const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
        const shortcode = process.env.MPESA_SHORTCODE;
        const passkey = process.env.MPESA_PASSKEY;
        const callbackUrl = process.env.MPESA_CALLBACK_URL;

        if (!consumerKey || !consumerSecret || !shortcode || !passkey || !callbackUrl) {
            return res.status(500).json({ error: 'Missing M-Pesa credentials in environment' });
        }

        const authResponse = await fetch(`${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
            headers: {
                Authorization: `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')}`,
            },
        });
        const authData = await authResponse.json();
        if (!authData.access_token) throw new Error('Unable to get M-Pesa access token');

        const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
        const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

        // For simplicity use order amount lookup in paymentsModel (or ordersModel could provide)
        const amount = Number(req.body.amount ?? 0);

        const stkRequest = {
            BusinessShortCode: shortcode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: amount,
            PartyA: phoneNumber,
            PartyB: shortcode,
            PhoneNumber: phoneNumber,
            CallBackURL: callbackUrl,
            AccountReference: orderId,
            TransactionDesc: `Payment for order ${orderId}`,
        };

        const response = await fetch(`${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${authData.access_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(stkRequest),
        });

        const responseData = await response.json();

        // create a payment record with PENDING
        if (responseData && responseData.CheckoutRequestID) {
            await createMpesaPayment({ orderId, amount, checkoutRequestId: responseData.CheckoutRequestID });
        }

        res.status(response.status).json(responseData);
    } catch (err) {
        next(err);
    }
}

export async function mpesaCallback(req: Request, res: Response, next: NextFunction) {
    try {
        const body = req.body;
        const stkCallback = body?.Body?.stkCallback;
        if (!stkCallback) return res.status(400).json({ error: 'Invalid payload' });

        const checkoutRequestId = String(stkCallback.CheckoutRequestID);
        const payment = await findPaymentByCheckoutRequestId(checkoutRequestId as any);
        if (!payment) {
            // create a record to keep raw payload for inspection
            await createMpesaPayment({ orderId: stkCallback.MerchantRequestID ?? 'unknown', amount: 0, checkoutRequestId, rawPayload: JSON.stringify(body) });
            return res.json({ result: 'ok' });
        }

        // idempotent handling
        if (payment.status === 'CONFIRMED' || payment.status === 'FAILED') {
            return res.json({ result: 'ignored' });
        }

        if (stkCallback.ResultCode === 0) {
            // success
            const receipt = (stkCallback.CallbackMetadata?.Item || []).find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value ?? null;
            const updated = await finalizeOrderPayment({ orderId: payment.orderId, paymentId: payment.id, reference: receipt });
            // emit socket
            try { const io = req.app.get('io'); if (io) io.emit('payment:confirmed', { orderId: payment.orderId, paymentId: payment.id }); } catch (e) { }
            return res.json({ result: 'confirmed' });
        }

        // failed
        await markPaymentExpired(payment.id, 'FAILED');
        return res.json({ result: 'failed' });
    } catch (err) {
        next(err);
    }
}

export async function manualPaymentHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const { orderId, method, reference, amount } = req.body;
        if (!orderId || !method) return res.status(400).json({ error: 'orderId and method required' });
        const payment = await createManualPayment({ orderId, method, reference, amount: Number(amount ?? 0) });
        res.status(201).json({ data: payment });
    } catch (err) {
        next(err);
    }
}

export async function getPaymentStatus(req: Request, res: Response, next: NextFunction) {
    try {
        const { checkoutRequestId } = req.params;
        if (!checkoutRequestId) return res.status(400).json({ error: 'checkoutRequestId required' });
        const payment = await findPaymentByCheckoutRequestId(String(checkoutRequestId) as any);
        if (!payment) return res.status(404).json({ error: 'Not found' });
        res.json({ data: { status: payment.status, reference: payment.reference } });
    } catch (err) {
        next(err);
    }
}
