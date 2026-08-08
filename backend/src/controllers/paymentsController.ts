
import type { Request, Response, NextFunction } from 'express';
import { savePaymentCallback } from '../models/paymentsModel.js';

const MPESA_BASE_URL = process.env.MPESA_ENVIRONMENT === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';

function getDarajaAuthHeaders(token: string) {
    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
}

export async function initiateStkPush(req: Request, res: Response, next: NextFunction) {
    try {
        const { productId, quantity, phoneNumber } = req.body;
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
        if (!authData.access_token) {
            throw new Error('Unable to get M-Pesa access token');
        }

        const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
        const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

        const stkRequest = {
            BusinessShortCode: shortcode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: req.body.amount,
            PartyA: phoneNumber,
            PartyB: shortcode,
            PhoneNumber: phoneNumber,
            CallBackURL: callbackUrl,
            AccountReference: productId,
            TransactionDesc: `Payment for product ${productId}`,
        };

        const response = await fetch(`${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
            method: 'POST',
            headers: getDarajaAuthHeaders(authData.access_token),
            body: JSON.stringify(stkRequest),
        });

        const responseData = await response.json();
        res.status(response.status).json(responseData);
    } catch (error) {
        next(error);
    }
}

export async function mpesaCallback(req: Request, res: Response, next: NextFunction) {
    try {
        await savePaymentCallback(req.body);
        // emit payment event to admin clients
        try {
            const io = req.app.get('io');
            if (io) io.emit('payment.received', req.body);
        } catch (err) {
            console.error('Failed to emit payment.received', err);
        }
        res.json({ result: 'success' });
    } catch (error) {
        next(error);
    }
}
