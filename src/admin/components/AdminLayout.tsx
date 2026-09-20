import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BarChart3, CircleHelp, CreditCard, Grid2x2, LogOut, Package, ReceiptText, Settings, type LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { io as ioClient, type Socket } from 'socket.io-client';

const navItems: Array<{ label: string; to: string; key: string; icon: LucideIcon }> = [
    { label: 'Overview', to: '/admin', key: 'overview', icon: Grid2x2 },
    { label: 'Products', to: '/admin/products', key: 'products', icon: Package },
    { label: 'Orders', to: '/admin/orders', key: 'orders', icon: ReceiptText },
    { label: 'Payments', to: '/admin/payments', key: 'payments', icon: CreditCard },
    { label: 'Analytics', to: '/admin/analytics', key: 'analytics', icon: BarChart3 },
];

function AdminLayout() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const [counts, setCounts] = useState<Record<string, number>>({ orders: 0, payments: 0 });
    const [, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? '';
        const s = ioClient(apiUrl, { transports: ['websocket'] });
        setSocket(s);

        s.on('connect', () => console.log('admin socket connected', s.id));
        s.on('order.created', () => {
            setCounts((c) => ({ ...c, orders: (c.orders ?? 0) + 1 }));
        });
        s.on('order.created.bulk', (orders) => {
            setCounts((c) => ({ ...c, orders: (c.orders ?? 0) + (Array.isArray(orders) ? orders.length : 1) }));
        });
        const refreshAdminData = () => {
            setCounts((c) => ({ ...c, payments: (c.payments ?? 0) + 1 }));
            window.dispatchEvent(new CustomEvent('admin:data.updated'));
        };

        s.on('order.created', refreshAdminData);
        s.on('order.created.bulk', refreshAdminData);
        s.on('payment.received', refreshAdminData);
        s.on('payment:confirmed', refreshAdminData);
        s.on('payment:approved', refreshAdminData);
        s.on('payment:rejected', refreshAdminData);

        return () => {
            s.disconnect();
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('admin-auth-token');
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 md:hidden">
                <span className="text-lg font-semibold text-slate-900">Admin console</span>
                <button
                    type="button"
                    className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white"
                    onClick={() => setIsOpen((open) => !open)}
                >
                    {isOpen ? 'Close' : 'Menu'}
                </button>
            </div>

            <aside
                className={`fixed inset-y-0 left-0 z-40 w-[220px] bg-slate-900 text-slate-200 transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                    } md:block`}
            >
                <div className="flex h-full flex-col">
                    <div className="px-6 pb-5 pt-7">
                        <Link to="/admin" className="block">
                            <div className="text-2xl font-bold leading-none tracking-tight">
                                <span className="text-white">Everything</span>
                                <span className="ml-1 text-emerald-500">Online</span>
                            </div>
                        </Link>
                        <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Admin Dashboard</p>
                    </div>

                    <nav className="flex-1 space-y-1 px-3 pb-6 pt-3">
                        {navItems.map(({ label, to, key, icon: Icon }) => (
                            <NavLink
                                key={key}
                                to={to}
                                end={to === '/admin'}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${isActive
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    }`
                                }
                            >
                                <>
                                    <Icon className="h-4 w-4" />
                                    <span className="flex-1">{label}</span>
                                    {(key === 'orders' || key === 'payments') && counts[key] > 0 ? (
                                        <span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                                            {counts[key]}
                                        </span>
                                    ) : null}
                                </>
                            </NavLink>
                        ))}
                    </nav>

                    <div className="border-t border-slate-700/80 px-3 py-4">
                        <div className="space-y-1">
                            <Link
                                to="/"
                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                            >
                                <Settings className="h-4 w-4" />
                                <span>View Store</span>
                            </Link>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="min-h-screen md:ml-[220px]">
                <div className="min-h-screen bg-slate-100 p-6 lg:p-8">
                    <div className="mx-auto max-w-[1400px]">
                        <Outlet />
                    </div>
                </div>
            </main>

            <button
                type="button"
                className="fixed bottom-6 right-6 inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-xl font-semibold text-slate-700 shadow-lg shadow-slate-200/80 transition hover:-translate-y-0.5 hover:text-emerald-600"
                aria-label="Help"
            >
                <CircleHelp className="h-5 w-5" />
            </button>
        </div>
    );
}

export default AdminLayout;
