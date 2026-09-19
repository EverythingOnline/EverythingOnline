import { useEffect, useState } from 'react';
import { fetchAdminOrders, updateAdminOrderStatus, type AdminOrder } from '../api/admin';
import OrderDetail from '../components/OrderDetail';

const statuses = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
const nextStatuses: Record<string, string[]> = {
    PENDING: ['CANCELLED'],
    PAID: ['PROCESSING', 'REFUNDED'],
    PROCESSING: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED', 'REFUNDED'],
    DELIVERED: [],
    CANCELLED: [],
    REFUNDED: [],
};

const statusStyles: Record<string, string> = {
    PENDING: 'border-yellow-200 bg-yellow-50 text-yellow-700',
    PAID: 'border-blue-200 bg-blue-50 text-blue-700',
    PROCESSING: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    SHIPPED: 'border-sky-200 bg-sky-50 text-sky-700',
    DELIVERED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    CANCELLED: 'border-rose-200 bg-rose-50 text-rose-700',
    REFUNDED: 'border-slate-200 bg-slate-100 text-slate-700',
};

function Orders() {
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

    const loadOrders = async () => {
        setIsLoading(true);
        try {
            const data = await fetchAdminOrders(statusFilter ? { status: statusFilter } : {});
            setOrders(data);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, [statusFilter]);

    useEffect(() => {
        const onRefresh = () => loadOrders();
        window.addEventListener('admin:data.updated', onRefresh);
        return () => window.removeEventListener('admin:data.updated', onRefresh);
    }, [statusFilter]);

    const handleStatusChange = async (orderId: string, nextStatus: string) => {
        const order = orders.find((item) => item.id === orderId);
        if (!order || nextStatus === order.status) return;
        setError(null);
        try {
            const updated = await updateAdminOrderStatus(orderId, nextStatus);
            setOrders((current) => current.map((order) => (order.id === orderId ? { ...order, ...updated } : order)));
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleOrderUpdated = (updated: AdminOrder) => {
        setOrders((current) => current.map((order) => (order.id === updated.id ? updated : order)));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
                <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                        Filter
                        <select
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                        >
                            <option value="">All statuses</option>
                            {statuses.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </label>
                    <button
                        type="button"
                        onClick={() => loadOrders()}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

            <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
                    <table className="min-w-full text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Order ID</th>
                                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Customer</th>
                                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Items</th>
                                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Total</th>
                                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Payment</th>
                                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Status</th>
                                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Date</th>
                                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                                        Loading orders...
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                                        No orders yet.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className={`hover:bg-slate-50/80 ${selectedOrderId === order.id ? 'bg-emerald-50/40' : ''}`}>
                                        <td className="px-4 py-4 text-sm font-semibold text-blue-600">#{order.id.slice(0, 8)}</td>
                                        <td className="px-4 py-4 text-sm text-slate-700">{order.customerPhone}</td>
                                        <td className="px-4 py-4 text-sm text-slate-700">{order.items?.length ?? 0}</td>
                                        <td className="px-4 py-4 text-sm font-bold text-emerald-600">KES {Number(order.total ?? 0).toLocaleString()}</td>
                                        <td className="px-4 py-4 text-sm text-slate-600">{order.paymentStatus}</td>
                                        <td className="px-4 py-4 text-sm">
                                            <select
                                                value={order.status}
                                                onChange={(event) => handleStatusChange(order.id, event.target.value)}
                                                disabled={nextStatuses[order.status]?.length === 0}
                                                className={`rounded-full border px-2.5 py-1.5 text-xs font-semibold outline-none ${statusStyles[order.status] ?? 'border-slate-200 bg-slate-50 text-slate-700'}`}
                                            >
                                                {[order.status, ...(nextStatuses[order.status] ?? [])].map((status) => (
                                                    <option key={status} value={status}>
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-500">
                                            {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-4 py-4 text-sm">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedOrderId(order.id)}
                                                className="font-medium text-blue-600 hover:text-blue-700"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="xl:sticky xl:top-6 xl:self-start">
                    {selectedOrderId ? (
                        <OrderDetail
                            orderId={selectedOrderId}
                            onClose={() => setSelectedOrderId(null)}
                            onUpdated={handleOrderUpdated}
                        />
                    ) : (
                        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                            Select an order to review items, record manual payment, or finalize checkout.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Orders;
