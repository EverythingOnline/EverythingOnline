import { Link, useLocation } from 'react-router-dom';

function CheckoutSuccess() {
    const location = useLocation();
    const state = (location.state as any) ?? {};
    const message = state.message ?? 'Thank you for your order.';
    const orders = state.orders as Array<{ id: string; total?: number; createdAt?: string }> | undefined;

    return (
        <div className="mx-auto max-w-3xl px-6 py-20 space-y-6">
            <h1 className="text-3xl font-semibold text-[#16332b]">Order complete</h1>
            <p className="mt-2 text-sm text-[#5a645d]">{message}</p>

            {orders && orders.length > 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <h2 className="text-lg font-medium text-slate-900">Order summary</h2>
                    <ul className="mt-3 space-y-2 text-sm text-slate-700">
                        {orders.map((o) => (
                            <li key={o.id} className="flex items-center justify-between">
                                <span>Order {o.id}</span>
                                <span>{o.total ? `KES ${o.total.toFixed(0)}` : ''}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <Link
                to="/products"
                className="mt-4 inline-flex rounded-3xl bg-[#16332b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1e4436]"
            >
                Continue shopping
            </Link>
        </div>
    );
}

export default CheckoutSuccess;
