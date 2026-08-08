import { useEffect, useMemo, useState } from 'react';
import StatCard from '../components/StatCard';
import { fetchAdminOrders, type AdminOrder } from '../api/admin';

function Dashboard() {
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchAdminOrders().then(setOrders).finally(() => setIsLoading(false));
    }, []);

    const totals = useMemo(() => {
        const today = new Date().toISOString().slice(0, 10);
        const todayOrders = orders.filter((order: any) => order.createdAt.startsWith(today));
        const lowStockCount = 0;
        return {
            totalOrders: todayOrders.length,
            pending: orders.filter((order: any) => order.status === 'PENDING').length,
            delivered: orders.filter((order: any) => order.status === 'DELIVERED').length,
            lowStockCount,
        };
    }, [orders]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-semibold text-slate-900">Dashboard</h1>
                    <p className="mt-2 text-sm text-slate-500">Overview of orders and stock alerts.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                <StatCard label="Orders today" value={isLoading ? 'Loading…' : totals.totalOrders} />
                <StatCard label="Pending orders" value={isLoading ? 'Loading…' : totals.pending} />
                <StatCard label="Delivered" value={isLoading ? 'Loading…' : totals.delivered} />
                <StatCard label="Low stock" value={isLoading ? 'Loading…' : totals.lowStockCount} accent="bg-rose-50" />
            </div>
        </div>
    );
}

export default Dashboard;
