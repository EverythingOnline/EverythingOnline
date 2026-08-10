import type { AdminOrder } from '../api/admin';

type OrderListProps = {
    orders: AdminOrder[];
    isLoading: boolean;
    onSelectOrder: (orderId: string) => void;
};

function OrderList({ orders, isLoading, onSelectOrder }: OrderListProps) {
    if (isLoading) {
        return <p className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600">Loading orders...</p>;
    }

    if (orders.length === 0) {
        return (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
                <p className="text-lg font-semibold">No orders yet</p>
                <p className="mt-2 text-sm">Once customers place an order, it will appear here.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-left">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Order</th>
                        <th className="px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Phone</th>
                        <th className="px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Status</th>
                        <th className="px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Total</th>
                        <th className="px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 text-sm text-slate-800">
                                <button type="button" onClick={() => onSelectOrder(order.id)} className="font-semibold text-slate-900 hover:text-slate-600">
                                    {order.id}
                                </button>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">{order.customerPhone}</td>
                            <td className="px-6 py-4 text-sm text-slate-800">{order.status}</td>
                            <td className="px-6 py-4 text-sm text-slate-800">KES {order.total.toFixed(0)}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default OrderList;
