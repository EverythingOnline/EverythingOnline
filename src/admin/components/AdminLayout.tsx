import { Link, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { io as ioClient, type Socket } from 'socket.io-client';

const navItems = [
    { label: 'Dashboard', to: '/admin', key: 'dashboard' },
    { label: 'Products', to: '/admin/products', key: 'products' },
    { label: 'Orders', to: '/admin/orders', key: 'orders' },
    { label: 'Payments', to: '/admin/payments', key: 'payments' },
];

function AdminLayout() {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const [counts, setCounts] = useState<Record<string, number>>({ orders: 0, payments: 0 });
    // keep reference to socket for potential future use
    const [, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const apiUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000').replace(/\/$/, '');
        const socketUrl = apiUrl; // backend origin
        const s = ioClient(socketUrl, { transports: ['websocket'] });
        setSocket(s);

        s.on('connect', () => console.log('admin socket connected', s.id));
        s.on('order.created', (order) => {
            console.log('order.created', order);
            window.dispatchEvent(new CustomEvent('admin:order.created', { detail: order }));
            setCounts((c) => ({ ...c, orders: (c.orders ?? 0) + 1 }));
        });
        s.on('order.created.bulk', (orders) => {
            console.log('order.created.bulk', orders);
            window.dispatchEvent(new CustomEvent('admin:order.created.bulk', { detail: orders }));
            setCounts((c) => ({ ...c, orders: (c.orders ?? 0) + (Array.isArray(orders) ? orders.length : 1) }));
        });
        s.on('payment.received', (payment) => {
            console.log('payment.received', payment);
            window.dispatchEvent(new CustomEvent('admin:payment.received', { detail: payment }));
            setCounts((c) => ({ ...c, payments: (c.payments ?? 0) + 1 }));
        });

        return () => {
            s.disconnect();
        };
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 md:hidden">
                <span className="text-lg font-semibold">Admin console</span>
                <button
                    type="button"
                    className="rounded-md bg-slate-800 px-3 py-2 text-sm text-white"
                    onClick={() => setIsOpen((open) => !open)}
                >
                    {isOpen ? 'Close' : 'Menu'}
                </button>
            </div>
            <div className="mx-auto flex max-w-[1400px] flex-col md:flex-row">
                <aside className={`transition-all duration-200 bg-white border-r border-slate-200 md:w-72 ${isOpen ? 'block' : 'hidden'} md:block`}>
                    <div className="px-6 py-6">
                        <Link to="/admin" className="block text-2xl font-semibold text-slate-900">
                            EverythingOnline
                        </Link>
                        <p className="mt-2 text-sm text-slate-500">Admin dashboard</p>
                    </div>
                    <nav className="space-y-1 px-4 pb-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`relative flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition hover:bg-slate-100 ${location.pathname === item.to ? 'bg-slate-100 text-slate-900' : 'text-slate-600'
                                    }`}
                                onClick={() => setIsOpen(false)}
                            >
                                <span>{item.label}</span>
                                {(item.key === 'orders' || item.key === 'payments') && counts[item.key] > 0 ? (
                                    <span className="ml-3 inline-flex items-center rounded-full bg-rose-500 px-2 py-0.5 text-xs font-semibold text-white">{counts[item.key]}</span>
                                ) : null}
                            </Link>
                        ))}
                    </nav>
                </aside>
                <main className="flex-1 p-6 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;
