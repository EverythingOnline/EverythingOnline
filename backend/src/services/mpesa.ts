import fetch from 'node-fetch';

const MPESA_ENV = (process.env.MPESA_ENVIRONMENT ?? process.env.MPESA_ENV) === 'production' ? 'production' : 'sandbox';
const MPESA_BASE_URL = MPESA_ENV === 'production' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke';

let cachedToken: { value: string; expiresAt: number } | undefined;

type MpesaStkResponse = {
    CheckoutRequestID?: string;
    [key: string]: unknown;
};

async function readMpesaResponse<T>(response: Response): Promise<T> {
    const body = await response.text();
    if (!body.trim()) {
        throw new Error(`M-Pesa returned an empty response (HTTP ${response.status})`);
    }

    try {
        return JSON.parse(body) as T;
    } catch {
        throw new Error(`M-Pesa returned invalid JSON (HTTP ${response.status})`);
    }
}

function requiredEnv(name: string) {
    const value = process.env[name];
    if (!value) throw new Error(`Missing ${name} in backend environment`);
    return value;
}

export async function getMpesaAccessToken() {
    if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;

    const consumerKey = requiredEnv('MPESA_CONSUMER_KEY');
    const consumerSecret = requiredEnv('MPESA_CONSUMER_SECRET');
    const response = await fetch(`${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: { Authorization: `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')}` },
    });
    // TEMP DEBUG - remove after diagnosing Merchant does not exist issue
    console.log('[MPESA DEBUG] Token request status:', response.status);
    const data = await readMpesaResponse<{ access_token?: string; expires_in?: string }>(response);
    if (!response.ok || !data.access_token) throw new Error('Unable to get M-Pesa access token');

    const expiresIn = Number(data.expires_in ?? 3600);
    cachedToken = { value: data.access_token, expiresAt: Date.now() + Math.max(60, expiresIn - 60) * 1000 };
    return cachedToken.value;
}

export function normalizeMpesaPhone(value: string) {
    const digits = value.replace(/[\s-]/g, '');
    const normalized = digits.startsWith('+254') ? digits.slice(1) : digits.startsWith('0') ? `254${digits.slice(1)}` : digits;
    if (!/^2547\d{8}$/.test(normalized)) throw new Error('Enter a valid Kenyan mobile number.');
    return normalized;
}

export function createStkPassword(tillNumber: string, passkey: string, timestamp: string) {
    return Buffer.from(`${tillNumber}${passkey}${timestamp}`).toString('base64');
}

export async function queryStkStatus(checkoutRequestId: string) {
    const tillNumber = requiredEnv('MPESA_TILL_NUMBER');
    const passkey = requiredEnv('MPESA_PASSKEY');
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
    const token = await getMpesaAccessToken();
    const payload = {
        BusinessShortCode: tillNumber,
        Password: createStkPassword(tillNumber, passkey, timestamp),
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
    };

    const response = await fetch(`${MPESA_BASE_URL}/mpesa/stkpushquery/v1/query`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    const data = await readMpesaResponse<Record<string, unknown>>(response);
    return { response, data };
}

export async function sendTillStkPush({ orderId, phoneNumber, amount }: { orderId: string; phoneNumber: string; amount: number }) {
    const tillNumber = requiredEnv('MPESA_TILL_NUMBER');
    const passkey = requiredEnv('MPESA_PASSKEY');
    const callbackUrl = requiredEnv('MPESA_CALLBACK_URL');
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
    const token = await getMpesaAccessToken();
    const payload = {
        BusinessShortCode: tillNumber,
        Password: createStkPassword(tillNumber, passkey, timestamp),
        Timestamp: timestamp,
        TransactionType: 'CustomerBuyGoodsOnline',
        Amount: Math.round(amount),
        PartyA: phoneNumber,
        PartyB: tillNumber,
        PhoneNumber: phoneNumber,
        CallBackURL: callbackUrl,
        AccountReference: orderId,
        TransactionDesc: `Payment for order ${orderId}`,
    };

    // TEMP DEBUG - remove after diagnosing Merchant does not exist issue
    console.log('[MPESA DEBUG] STK push payload:', JSON.stringify(payload, null, 2));
    const response = await fetch(`${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    // TEMP DEBUG - remove after diagnosing Merchant does not exist issue
    const rawText = await response.clone().text();
    console.log('[MPESA DEBUG] Response status:', response.status);
    console.log('[MPESA DEBUG] Response body:', rawText);
    const data = await readMpesaResponse<MpesaStkResponse>(response);
    return { response, data };
}
