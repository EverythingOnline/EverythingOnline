import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminOrders, updateAdminOrderStatus, type AdminOrder } from '../api/admin';

const statuses = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

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

    const loadOrders = async () => {
        setIsLoading(true);
        try {
            const data = await fetchAdminOrders();
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
    }, []);

    const handleStatusChange = async (orderId: string, nextStatus: string) => {
        try {
            const updated = await updateAdminOrderStatus(orderId, nextStatus);
            setOrders((current) => current.map((order) => (order.id === orderId ? updated : order)));
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
            </div>

            {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
                <table className="min-w-full text-left">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Order ID</th>
                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Customer</th>
                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Items</th>
                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Total</th>
                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Status</th>
                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Date</th>
                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                        {isLoading ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                                    Loading orders...
                                </td>
                            </tr>
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                                    No orders yet.
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50/80">
                                    <td className="px-4 py-4 text-sm font-semibold text-blue-600">#{order.id.slice(0, 8)}</td>
                                    <td className="px-4 py-4 text-sm text-slate-700">{order.customerPhone}</td>
                                    <td className="px-4 py-4 text-sm text-slate-700">{Array.isArray(order.items) ? order.items.length : 1}</td>
                                    <td className="px-4 py-4 text-sm font-bold text-emerald-600">KES {Number(order.total ?? 0).toLocaleString()}</td>
                                    <td className="px-4 py-4 text-sm">
                                        <select
                                            value={order.status}
                                            onChange={(event) => handleStatusChange(order.id, event.target.value)}
                                            className={`rounded-full border px-2.5 py-1.5 text-xs font-semibold outline-none ${statusStyles[order.status] ?? 'border-slate-200 bg-slate-50 text-slate-700'}`}
                                        >
                                            {statuses.map((status) => (
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
                                        <Link to="/admin/orders" className="font-medium text-blue-600 hover:text-blue-700">
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Orders;
