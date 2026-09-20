const API_URL = import.meta.env.VITE_API_URL;

export type AdminOrderItem = {
    id: string;
    productId: string;
    name: string;
    sku?: string | null;
    quantity: number;
    unitPrice: number;
    total: number;
};

export type AdminCategory = { id: string; name: string };

export type AdminProduct = {
    id: string;
    name: string;
    price: number;
    stock: number;
    lowStockThreshold: number;
    categoryId: string;
    category: AdminCategory;
    imageUrl: string | null;
    description: string;
    active: boolean;
};

export type AdminOrder = {
    id: string;
    customerPhone: string;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    items: AdminOrderItem[];
    subtotal: number;
    deliveryFee: number;
    total: number;
    createdAt: string;
    updatedAt?: string;
    payments?: Array<{
        id: string;
        method?: string;
        reference?: string | null;
        status?: string;
        amount?: number;
        createdAt?: string;
    }>;
};

function getAdminToken() {
    return localStorage.getItem('admin-auth-token');
}

export function getAdminAuthHeaders(extraHeaders?: Record<string, string>): Record<string, string> {
    const token = getAdminToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(extraHeaders ?? {}),
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}

export async function adminFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const authHeaders = getAdminAuthHeaders();
    if (options?.body instanceof FormData) delete authHeaders['Content-Type'];

    const response = await fetch(`${API_URL}${path}`, {
        headers: { ...authHeaders, ...(options?.headers ?? {}) },
        ...options,
    });

    if (!response.ok) {
        const body = await response.text();
        if (response.status === 401) {
            localStorage.removeItem('admin-auth-token');
            window.location.assign('/admin/login');
        }
        throw new Error(`Admin API error (${response.status}): ${body}`);
    }

    return response.json() as Promise<T>;
}

export async function fetchAdminProducts(): Promise<AdminProduct[]> {
    const result = await adminFetch<{ data: AdminProduct[]; meta: { total: number } }>('/api/admin/products');
    return result.data;
}

export async function fetchAdminProduct(id: string): Promise<AdminProduct> {
    const result = await adminFetch<{ data: AdminProduct }>(`/api/admin/products/${encodeURIComponent(id)}`);
    return result.data;
}

export async function fetchAdminCategories(): Promise<AdminCategory[]> {
    const result = await adminFetch<{ data: AdminCategory[] }>('/api/categories');
    return result.data;
}

export type AdminOrderFilters = {
    status?: string;
    paymentStatus?: string;
    customerPhone?: string;
};

export async function fetchAdminOrders(filters: AdminOrderFilters = {}): Promise<AdminOrder[]> {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.paymentStatus) params.set('paymentStatus', filters.paymentStatus);
    if (filters.customerPhone) params.set('customerPhone', filters.customerPhone);
    const query = params.toString() ? `?${params.toString()}` : '';
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
    orderId: string;
    method: string;
    status: string;
    amount: number;
    reference?: string | null;
    merchantRequestId?: string | null;
    checkoutRequestId?: string | null;
    resultCode?: number | null;
    resultDesc?: string | null;
    createdAt: string;
    order?: {
        id: string;
        customerPhone?: string;
        total?: number;
        user?: { email?: string | null };
    };
};

export async function fetchAdminPayments(): Promise<PaymentRecord[]> {
    const result = await adminFetch<{ data: PaymentRecord[] }>('/api/admin/payments');
    return result.data;
}

export async function fetchAdminPendingPayments(method?: string): Promise<PaymentRecord[]> {
    const query = method ? `?method=${encodeURIComponent(method)}` : '';
    const result = await adminFetch<{ data: PaymentRecord[] }>(`/api/admin/payments/pending${query}`);
    return result.data;
}

export async function approveAdminPayment(id: string): Promise<PaymentRecord> {
    const result = await adminFetch<{ data: PaymentRecord }>(`/api/admin/payments/${encodeURIComponent(id)}/approve`, { method: 'POST' });
    return result.data;
}

export async function rejectAdminPayment(id: string, payload?: { note?: string }): Promise<PaymentRecord> {
    const result = await adminFetch<{ data: PaymentRecord }>(`/api/admin/payments/${encodeURIComponent(id)}/reject`, {
        method: 'POST',
        body: JSON.stringify(payload || {}),
    });
    return result.data;
}

export async function updateAdminOrderStatus(id: string, status: string): Promise<AdminOrder> {
    const result = await adminFetch<{ data: AdminOrder }>(`/api/admin/orders/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    });
    return result.data;
}

export type AdminProductInput = {
    name: string;
    price: number;
    stock: number;
    lowStockThreshold: number;
    categoryId: string;
    description: string;
    active: boolean;
    image?: File;
};

function productFormData(product: AdminProductInput) {
    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('price', String(product.price));
    formData.append('stock', String(product.stock));
    formData.append('lowStockThreshold', String(product.lowStockThreshold));
    formData.append('categoryId', product.categoryId);
    formData.append('description', product.description);
    formData.append('active', String(product.active));
    if (product.image) formData.append('image', product.image);
    return formData;
}

export async function createAdminProduct(product: AdminProductInput): Promise<AdminProduct> {
    const result = await adminFetch<{ data: AdminProduct }>('/api/admin/products', {
        method: 'POST',
        body: productFormData(product),
    });
    return result.data;
}

export async function updateAdminProduct(id: string, product: AdminProductInput): Promise<AdminProduct> {
    const result = await adminFetch<{ data: AdminProduct }>(`/api/admin/products/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: productFormData(product),
    });
    return result.data;
}

export async function removeAdminProduct(id: string): Promise<AdminProduct> {
    const result = await adminFetch<{ data: AdminProduct }>(`/api/admin/products/${encodeURIComponent(id)}/remove`, {
        method: 'PATCH',
    });
    return result.data;
}

export async function restoreAdminProduct(id: string): Promise<AdminProduct> {
    const result = await adminFetch<{ data: AdminProduct }>(`/api/admin/products/${encodeURIComponent(id)}/restore`, {
        method: 'PATCH',
    });
    return result.data;
}

export type AdminLowStockProduct = {
    id: string;
    name: string;
    stock: number;
    lowStockThreshold: number;
};

export type AdminTopSellingProduct = {
    id: string;
    name: string;
    quantitySold: number;
};

export async function fetchAdminLowStock(): Promise<AdminLowStockProduct[]> {
    const result = await adminFetch<{ data: AdminLowStockProduct[] }>('/api/admin/analytics/low-stock');
    return result.data;
}

export async function fetchAdminOutOfStock(): Promise<AdminLowStockProduct[]> {
    const result = await adminFetch<{ data: AdminLowStockProduct[] }>('/api/admin/analytics/out-of-stock');
    return result.data;
}

export async function fetchAdminTopSelling(window: '7d' | '30d' | 'all' = '7d'): Promise<AdminTopSellingProduct[]> {
    const result = await adminFetch<{ data: AdminTopSellingProduct[] }>(`/api/admin/analytics/top-selling?window=${window}`);
    return result.data;
}

export async function fetchAdminRevenue(): Promise<{ today: number; thisWeek: number; thisMonth: number }> {
    const result = await adminFetch<{ data: { today: number; thisWeek: number; thisMonth: number } }>('/api/admin/analytics/revenue');
    return result.data;
}
