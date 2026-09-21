const API_URL = import.meta.env.VITE_API_URL;

type OrderPayload = {
    productId: string;
    quantity: number;
    customerPhone: string;
};

export async function createOrder(payload: OrderPayload) {
    try {
        const response = await fetch(`${API_URL}/api/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const body = await response.text();
            throw new Error(`Order failed (${response.status}): ${body}`);
        }

        const data = await response.json();
        return data;
    } catch (err: any) {
        if (err instanceof TypeError) {
            throw new Error(`Network error: unable to reach backend at ${API_URL}. Is the backend running?`);
        }
        throw err;
    }
}

type BulkOrderPayload = {
    items: { productId: string; quantity: number }[];
    customerPhone: string;
};

export async function createBulkOrders(payload: BulkOrderPayload) {
    try {
        const response = await fetch(`${API_URL}/api/orders/bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const body = await response.text();
            throw new Error(`Bulk order failed (${response.status}): ${body}`);
        }

        const data = await response.json();
        const order = data.data;
        return {
            ...data,
            data: Array.isArray(order) ? order : order ? [order] : [],
        };
    } catch (err: any) {
        if (err instanceof TypeError) {
            throw new Error(`Network error: unable to reach backend at ${API_URL}. Is the backend running?`);
        }
        throw err;
    }
}

export async function initiateMpesaCheckout({ orderId, phoneNumber }: { orderId: string; phoneNumber: string }) {
    const response = await fetch(`${API_URL}/api/checkout/stk-push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, phoneNumber }),
    });
    if (!response.ok) {
        const body = await response.text();
        let message = body || 'Failed to initiate M-Pesa checkout';
        try {
            const parsed = JSON.parse(body) as { error?: string };
            message = parsed.error || message;
        } catch {
            // Keep the raw response when the backend does not return JSON.
        }
        throw new Error(message);
    }
    return response.json();
}

export async function getMpesaPaymentStatus(orderId: string) {
    const response = await fetch(`${API_URL}/api/checkout/payment-status/${encodeURIComponent(orderId)}`);
    if (!response.ok) throw new Error('Unable to fetch payment status');
    return response.json();
}

async function checkoutRequest(path: string, init: RequestInit) {
    const response = await fetch(`${API_URL}/api/checkout${path}`, {
        ...init,
        headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
    });
    if (!response.ok) {
        const body = await response.text();
        throw new Error(body || `Checkout request failed (${response.status})`);
    }
    return response.json();
}

export function createCheckoutDraft(payload: { items: { productId: string; quantity: number }[]; deliveryFee: number; shippingMethod: string; paymentMethod: string }) {
    return checkoutRequest('/draft', { method: 'POST', body: JSON.stringify(payload) });
}

export function updateCheckoutShipping(orderId: string, shippingMethod: string, deliveryFee: number) {
    return checkoutRequest(`/${orderId}/shipping`, { method: 'PATCH', body: JSON.stringify({ shippingMethod, deliveryFee }) });
}

export function updateCheckoutContact(orderId: string, payload: Record<string, string>) {
    return checkoutRequest(`/${orderId}/contact`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export function finalizeCheckout(orderId: string) {
    return checkoutRequest(`/${orderId}/finalize`, { method: 'POST', body: JSON.stringify({}) });
}
