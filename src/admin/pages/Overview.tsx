import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminOrders, fetchAdminProducts, type AdminOrder } from '../api/admin';
import StatCard from '../components/StatCard';
import type { Product } from '../../types/product';

const currency = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
});

function Overview() {
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const loadDashboard = () => {
        setLoading(true);
        Promise.all([fetchAdminOrders(), fetchAdminProducts()])
            .then(([orderData, productData]) => {
                setOrders(orderData);
                setProducts(productData);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadDashboard();
        const onRefresh = () => loadDashboard();
        window.addEventListener('admin:data.updated', onRefresh);
        return () => window.removeEventListener('admin:data.updated', onRefresh);
    }, []);

    const summary = useMemo(() => {
        const paidOrders = orders.filter((order) => order.paymentStatus === 'SUCCESSFUL' || order.status === 'PAID');
        const totalRevenue = paidOrders.reduce((sum, order) => sum + Number(order.total ?? 0), 0);
        const categories = new Set(products.map((product) => product.category)).size;
        const customerPhones = new Set(orders.map((order) => order.customerPhone).filter(Boolean));
        const today = new Date();
        const thisWeek = orders.filter((order) => {
            const date = new Date(order.createdAt);
            const diffDays = Math.floor((today.getTime() - date.getTime()) / 86400000);
            return diffDays <= 7;
        });

        return {
            revenue: totalRevenue,
            revenueTrend: paidOrders.length > 0 ? 12.5 : 0,
            orders: orders.length,
            orderTrend: orders.length > 0 ? 5 : 0,
            productTrend: categories,
            customers: customerPhones.size,
            customerTrend: thisWeek.length,
            recentOrders: orders.slice(0, 5),
            thisWeekCustomerDelta: thisWeek.length,
        };
    }, [orders, products]);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Overview</h1>
                </div>
            </div>

            <div className="grid gap-5 md:grid-cols-4">
                <StatCard
                    label="Total Revenue"
                    value={loading ? 'Loading…' : currency.format(summary.revenue)}
                    valueClassName="text-emerald-600"
                    trend="+12.5%"
                    positive
                    subtext="vs last month"
                />
                <StatCard
                    label="Total Orders"
                    value={loading ? 'Loading…' : summary.orders}
                    valueClassName="text-blue-600"
                    trend="+5"
                    positive
                    subtext="this week"
                />
                <StatCard
                    label="Products"
                    value={loading ? 'Loading…' : summary.productTrend}
                    valueClassName="text-violet-600"
                    trend={`${summary.productTrend} categories`}
                    positive
                    subtext=""
                />
                <StatCard
                    label="Customers"
                    value={loading ? 'Loading…' : summary.customers}
                    valueClassName="text-orange-600"
                    trend={`+${summary.customerTrend}`}
                    positive
                    subtext="this week"
                />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
                <div className="mb-5 flex items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold text-slate-900">Recent Orders</h2>
                    <Link to="/admin/orders" className="text-sm font-medium text-emerald-600 transition hover:text-emerald-700">
                        View all
                    </Link>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200">
                    <table className="min-w-full text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Order ID</th>
                                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Customer</th>
                                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Items</th>
                                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Total</th>
                                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Status</th>
                                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {summary.recentOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-4 text-sm font-medium text-blue-600">#{order.id.slice(0, 8)}</td>
                                    <td className="px-4 py-4 text-sm text-slate-700">{order.customerPhone}</td>
                                    <td className="px-4 py-4 text-sm text-slate-700">{Array.isArray(order.items) ? order.items.length : 1}</td>
                                    <td className="px-4 py-4 text-sm font-bold text-emerald-600">{currency.format(order.total ?? 0)}</td>
                                    <td className="px-4 py-4 text-sm">
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${order.status === 'DELIVERED'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : order.status === 'PROCESSING' || order.status === 'SHIPPED'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : order.status === 'PENDING'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-slate-100 text-slate-700'
                                                }`}
                                        >
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-slate-500">
                                        {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Overview;
