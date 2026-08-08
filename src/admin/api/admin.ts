import type { Product } from '../../types/product';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export type AdminOrder = {
    id: string;
    productId: string;
    customerPhone: string;
    status: string;
    items: string;
    subtotal: number;
    deliveryFee: number;
    total: number;
    createdAt: string;
};

async function adminFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`Admin API error (${response.status}): ${body}`);
    }

    return response.json() as Promise<T>;
}

export async function fetchAdminProducts(): Promise<Product[]> {
    const result = await adminFetch<{ data: Product[]; meta: { total: number } }>('/api/products');
    return result.data;
}

export async function fetchAdminOrders(status?: string): Promise<AdminOrder[]> {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    const result = await adminFetch<{ data: AdminOrder[] }>(`/api/admin/orders${query}`);
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

