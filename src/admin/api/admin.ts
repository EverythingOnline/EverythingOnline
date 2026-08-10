import type { Product } from '../../types/product';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export type AdminOrder = {
    id: string;
    productId: string;
    customerPhone: string;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    items: string;
    subtotal: number;
    deliveryFee: number;
    total: number;
    createdAt: string;
    updatedAt?: string;
    payment?: {
        id: string;
        method?: string;
        reference?: string;
        recordedAt?: string;
        isManual?: boolean;
        status?: string;
    };
};

function getAdminToken() {
    return localStorage.getItem('admin-auth-token');
}

async function adminFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const token = getAdminToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${path}`, {
        headers,
        ...options,
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`Admin API error (${response.status}): ${body}`);
    }

    return response.json() as Promise<T>;
}

export async function fetchAdminProducts(): Promise<Product[]> {
    const result = await adminFetch<{ data: Product[]; meta: { total: number } }>('/api/admin/products');
    return result.data;
}

export async function fetchAdminOrders(status?: string): Promise<AdminOrder[]> {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    const result = await adminFetch<{ data: AdminOrder[] }>(`/api/admin/orders${query}`);
    return result.data;
}

export async function fetchAdminOrder(id: string): Promise<AdminOrder> {
    const result = await adminFetch<{ data: AdminOrder }>(`/api/admin/orders/${encodeURIComponent(id)}`);
    return result.data;
}

export async function recordManualPayment(id: string, payload: { paymentMethod: string; amountReceived: number; paymentReference?: string }) {
    const result = await adminFetch<{ data: AdminOrder }>(`/api/admin/orders/${encodeURIComponent(id)}/manual-payment`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return result.data;
}

export async function finalizeOrderCheckout(id: string) {
    const result = await adminFetch<{ data: AdminOrder }>(`/api/admin/orders/${encodeURIComponent(id)}/finalize-checkout`, {
        method: 'POST',
    });
    return result.data;
}

export type PaymentRecord = {
    id: string;
    merchantRequestId: string;
    checkoutRequestId: string;
    resultCode: number;
    resultDesc: string;
    createdAt: string;
    callbackData: string;
    rawPayload: string;
};

export async function fetchAdminPayments(): Promise<PaymentRecord[]> {
    const result = await adminFetch<{ data: PaymentRecord[] }>('/api/admin/payments');
    return result.data;
}

export async function createAdminProduct(product: Partial<Product>): Promise<Product> {
    const result = await adminFetch<{ data: Product }>('/api/admin/products', {
        method: 'POST',
        body: JSON.stringify(product),
    });
    return result.data;
}

export async function updateAdminProduct(id: string, product: Partial<Product>): Promise<Product> {
    const result = await adminFetch<{ data: Product }>(`/api/admin/products/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(product),
    });
    return result.data;
}

export async function deleteAdminProduct(id: string): Promise<void> {
    await adminFetch<void>(`/api/admin/products/${encodeURIComponent(id)}`, {
        method: 'DELETE',
    });
}

