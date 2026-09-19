import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, TrendingUp } from 'lucide-react';
import StatCard from '../components/StatCard';
import {
    fetchAdminLowStock,
    fetchAdminOutOfStock,
    fetchAdminRevenue,
    fetchAdminTopSelling,
    type AdminLowStockProduct,
    type AdminTopSellingProduct,
} from '../api/admin';

const currency = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
});

type AnalyticsWindow = '7d' | '30d' | 'all';

function Analytics() {
    const [window, setWindow] = useState<AnalyticsWindow>('7d');
    const [revenue, setRevenue] = useState({ today: 0, thisWeek: 0, thisMonth: 0 });
    const [lowStock, setLowStock] = useState<AdminLowStockProduct[]>([]);
    const [outOfStock, setOutOfStock] = useState<AdminLowStockProduct[]>([]);
    const [topSelling, setTopSelling] = useState<AdminTopSellingProduct[]>([]);
    const [loading, setLoading] = useState(true);

    const loadAnalytics = () => {
        setLoading(true);
        Promise.all([
            fetchAdminRevenue(),
            fetchAdminLowStock(),
            fetchAdminOutOfStock(),
            fetchAdminTopSelling(window),
        ])
            .then(([revenueData, lowStockData, outOfStockData, topSellingData]) => {
                setRevenue(revenueData);
                setLowStock(lowStockData);
                setOutOfStock(outOfStockData);
                setTopSelling(topSellingData);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadAnalytics();
    }, [window]);

    const analyticsSummary = useMemo(() => ({
        revenue: revenue.thisMonth,
        todayRevenue: revenue.today,
        weekRevenue: revenue.thisWeek,
        lowStockCount: lowStock.length,
        outOfStockCount: outOfStock.length,
    }), [revenue, lowStock, outOfStock]);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
                </div>
                <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                    {(['7d', '30d', 'all'] as const).map((option) => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => setWindow(option)}
                            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${window === option ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            {option === '7d' ? '7 days' : option === '30d' ? '30 days' : 'All time'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid gap-5 md:grid-cols-4">
                <StatCard label="Today" value={loading ? 'Loading…' : currency.format(analyticsSummary.todayRevenue)} valueClassName="text-emerald-600" subtext="Revenue" />
                <StatCard label="This Week" value={loading ? 'Loading…' : currency.format(analyticsSummary.weekRevenue)} valueClassName="text-blue-600" subtext="Revenue" />
                <StatCard label="This Month" value={loading ? 'Loading…' : currency.format(analyticsSummary.revenue)} valueClassName="text-violet-600" subtext="Revenue" />
                <StatCard label="Low Stock" value={loading ? 'Loading…' : String(analyticsSummary.lowStockCount)} valueClassName="text-amber-600" subtext="Products" />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <h2 className="text-xl font-semibold text-slate-900">Low Stock Alerts</h2>
                        <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                            {analyticsSummary.lowStockCount} flagged
                        </span>
                    </div>
                    <div className="space-y-3">
                        {lowStock.length ? lowStock.map((item) => (
                            <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                                <div>
                                    <p className="font-medium text-slate-900">{item.name}</p>
                                    <p className="text-xs text-slate-500">Threshold {item.lowStockThreshold}</p>
                                </div>
                                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">{item.stock} left</span>
                            </div>
                        )) : <p className="text-sm text-slate-500">No products are currently low on stock.</p>}
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <h2 className="text-xl font-semibold text-slate-900">Out of Stock</h2>
                        <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700">
                            {analyticsSummary.outOfStockCount} items
                        </span>
                    </div>
                    <div className="space-y-3">
                        {outOfStock.length ? outOfStock.map((item) => (
                            <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                                <div>
                                    <p className="font-medium text-slate-900">{item.name}</p>
                                    <p className="text-xs text-slate-500">Stock threshold: {item.lowStockThreshold}</p>
                                </div>
                                <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">Out</span>
                            </div>
                        )) : <p className="text-sm text-slate-500">No products are out of stock.</p>}
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
                <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">Top Selling Products</h2>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                        <TrendingUp className="h-3.5 w-3.5" />
                        {window === '7d' ? 'Past 7 days' : window === '30d' ? 'Past 30 days' : 'All time'}
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200">
                    <table className="min-w-full text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Rank</th>
                                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Product</th>
                                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Units Sold</th>
                                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Momentum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {topSelling.length ? topSelling.map((product, index) => (
                                <tr key={product.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-4 text-sm font-semibold text-slate-500">#{index + 1}</td>
                                    <td className="px-4 py-4 font-medium text-slate-900">{product.name}</td>
                                    <td className="px-4 py-4 text-sm text-slate-700">{product.quantitySold}</td>
                                    <td className="px-4 py-4 text-sm text-emerald-600">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 font-medium">
                                            <ArrowUpRight className="h-3.5 w-3.5" />
                                            Rising
                                        </span>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-500">No paid sales recorded in this period.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Analytics;
