const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

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
        return data;
    } catch (err: any) {
        if (err instanceof TypeError) {
            throw new Error(`Network error: unable to reach backend at ${API_URL}. Is the backend running?`);
        }
        throw err;
    }
}
