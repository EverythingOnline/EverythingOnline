import { useEffect, useState, useRef, useCallback } from 'react';
import OrderList from '../components/OrderList';
import { fetchAdminOrders, type AdminOrder } from '../api/admin';

const statuses = ['', 'PENDING', 'PAID', 'DELIVERED'];

function Orders() {
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isMounted = useRef(true);
    const loadOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchAdminOrders(statusFilter);
            if (isMounted.current) setOrders(data);
        } catch (err: any) {
            if (isMounted.current) setError(err.message);
        } finally {
            if (isMounted.current) setIsLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        isMounted.current = true;
        loadOrders();
        const id = setInterval(loadOrders, 5000);
        const onOrder = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            loadOrders();
            // optionally show a brief UI flash or badge clear using DOM event
            window.dispatchEvent(new CustomEvent('admin:orders.notified', { detail }));
        };
        const onOrderBulk = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            loadOrders();
            window.dispatchEvent(new CustomEvent('admin:orders.notified.bulk', { detail }));
        };
        window.addEventListener('admin:order.created', onOrder as EventListener);
        window.addEventListener('admin:order.created.bulk', onOrderBulk as EventListener);
        return () => {
            isMounted.current = false;
            clearInterval(id);
            window.removeEventListener('admin:order.created', onOrder as EventListener);
            window.removeEventListener('admin:order.created.bulk', onOrderBulk as EventListener);
        };
    }, [loadOrders]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-semibold text-slate-900">Orders</h1>
                    <p className="mt-2 text-sm text-slate-500">View store orders and filter by payment status.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <label className="text-sm font-medium text-slate-700">
                        Status
                        <select
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                            className="mt-2 block rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900"
                        >
                            {statuses.map((status) => (
                                <option key={status} value={status}>
                                    {status || 'All'}
                                </option>
                            ))}
                        </select>
                    </label>
                    <button
                        type="button"
                        onClick={() => loadOrders()}
                        className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {error && <p className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

            <OrderList orders={orders} isLoading={isLoading} />
        </div>
    );
}

export default Orders;
