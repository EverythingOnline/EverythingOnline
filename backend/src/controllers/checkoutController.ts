import type { Request, Response, NextFunction } from 'express';
import fetch from 'node-fetch';
import { createMpesaPayment, markPaymentExpired, findPaymentByCheckoutRequestId, createManualPayment } from '../models/paymentsModel.js';
import { finalizeOrderPayment, getOrderById } from '../models/ordersModel.js';

const MPESA_BASE_URL = process.env.MPESA_ENVIRONMENT === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';

export async function initiateMpesa(req: Request, res: Response, next: NextFunction) {
    try {
        const { orderId, phoneNumber } = req.body;
        if (!orderId || !phoneNumber) return res.status(400).json({ error: 'orderId and phoneNumber required' });

        const order = await getOrderById(String(orderId));
        if (!order) {
            return res.status(404).json({ error: 'Order not found. Create the order before starting M-Pesa checkout.' });
        }

        const consumerKey = process.env.MPESA_CONSUMER_KEY;
        const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
        const shortcode = process.env.MPESA_SHORTCODE;
        const passkey = process.env.MPESA_PASSKEY;
        const callbackUrl = process.env.MPESA_CALLBACK_URL;
        const mockMode = process.env.MPESA_MOCK_MODE !== 'false';

        const amount = Number(req.body.amount ?? 0);

        if (!consumerKey || !consumerSecret || !shortcode || !passkey || !callbackUrl) {
            if (!mockMode) {
                return res.status(500).json({ error: 'Missing M-Pesa credentials in environment' });
            }

            const checkoutRequestId = `MOCK-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
            await createMpesaPayment({ orderId, amount, checkoutRequestId, rawPayload: JSON.stringify({ mock: true, phoneNumber, amount }) });
            return res.status(200).json({
                CheckoutRequestID: checkoutRequestId,
                MerchantRequestID: `MERCHANT-${Date.now()}`,
                ResponseCode: '0',
                ResponseDescription: 'Mock STK push generated for local development.',
                mockMode: true,
            });
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
        if (!stkCallback) {
            return res.status(400).json({ error: 'Invalid payload' });
        }

        const checkoutRequestId = String(stkCallback.CheckoutRequestID ?? '');
        if (!checkoutRequestId) {
            return res.status(400).json({ error: 'Missing checkoutRequestId in callback payload' });
        }

        const payment = await findPaymentByCheckoutRequestId(checkoutRequestId as any);
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
            return res.json({ result: 'ignored', reason: 'unknown checkoutRequestId' });
        }

        if (payment.status === 'CONFIRMED' || payment.status === 'FAILED') {
            return res.json({ result: 'ignored' });
        }

        if (stkCallback.ResultCode === 0) {
            const receipt = (stkCallback.CallbackMetadata?.Item || []).find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value ?? null;
            await finalizeOrderPayment({ orderId: payment.orderId, paymentId: payment.id, reference: receipt, resultCode: stkCallback.ResultCode, resultDesc: stkCallback.ResultDesc });
            try { const io = req.app.get('io'); if (io) io.emit('payment:confirmed', { orderId: payment.orderId, paymentId: payment.id }); } catch (e) { }
            return res.json({ result: 'confirmed' });
        }

        await markPaymentExpired(payment.id, 'FAILED', stkCallback.ResultCode, stkCallback.ResultDesc);
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
