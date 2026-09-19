import { useEffect, useState, useRef, useCallback } from 'react';
import {
    fetchAdminPayments,
    fetchAdminPendingPayments,
    approveAdminPayment,
    rejectAdminPayment,
    type PaymentRecord,
} from '../api/admin';

type Tab = 'pending' | 'all';

function formatPaymentStatus(payment: PaymentRecord) {
    if (payment.status === 'AWAITING_REVIEW') return 'Awaiting review';
    if (payment.status === 'CONFIRMED' || payment.status === 'SUCCESSFUL') return 'Confirmed';
    if (payment.status === 'PENDING') return 'Pending';
    if (payment.status === 'EXPIRED') return 'Expired';
    if (payment.status === 'FAILED') return 'Failed';
    return payment.status;
}

function Payments() {
    const [tab, setTab] = useState<Tab>('pending');
    const [pendingPayments, setPendingPayments] = useState<PaymentRecord[]>([]);
    const [allPayments, setAllPayments] = useState<PaymentRecord[]>([]);
    const [methodFilter, setMethodFilter] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isMounted = useRef(true);
    const loadPayments = useCallback(async () => {
        setIsLoading(true);
        try {
            const [pending, all] = await Promise.all([
                fetchAdminPendingPayments(methodFilter || undefined),
                fetchAdminPayments(),
            ]);
            if (isMounted.current) {
                setPendingPayments(pending);
                setAllPayments(all);
                setError(null);
            }
        } catch (err: any) {
            if (isMounted.current) setError(err.message);
        } finally {
            if (isMounted.current) setIsLoading(false);
        }
    }, [methodFilter]);

    useEffect(() => {
        isMounted.current = true;
        loadPayments();
        const id = setInterval(loadPayments, 15000);
        const onPayment = () => loadPayments();
        window.addEventListener('admin:payments.updated', onPayment as EventListener);
        window.addEventListener('admin:data.updated', onPayment as EventListener);
        return () => {
            isMounted.current = false;
            clearInterval(id);
            window.removeEventListener('admin:payments.updated', onPayment as EventListener);
            window.removeEventListener('admin:data.updated', onPayment as EventListener);
        };
    }, [loadPayments]);

    const visiblePayments = tab === 'pending' ? pendingPayments : allPayments;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-semibold text-slate-900">Payments</h1>
                    <p className="mt-2 text-sm text-slate-500">Approve customer-submitted manual payments and monitor M-Pesa activity.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={methodFilter}
                        onChange={(event) => setMethodFilter(event.target.value)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                    >
                        <option value="">All methods</option>
                        <option value="CASH">Cash</option>
                        <option value="BANK_TRANSFER">Bank transfer</option>
                        <option value="MANUAL_MPESA_TILL">M-Pesa till</option>
                        <option value="MPESA_DARAJA">M-Pesa STK</option>
                    </select>
                    <button
                        type="button"
                        onClick={() => loadPayments()}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1">
                <button
                    type="button"
                    onClick={() => setTab('pending')}
                    className={`rounded-xl px-4 py-2 text-sm font-medium ${tab === 'pending' ? 'bg-emerald-500 text-white' : 'text-slate-600'}`}
                >
                    Pending review ({pendingPayments.length})
                </button>
                <button
                    type="button"
                    onClick={() => setTab('all')}
                    className={`rounded-xl px-4 py-2 text-sm font-medium ${tab === 'all' ? 'bg-emerald-500 text-white' : 'text-slate-600'}`}
                >
                    All transactions
                </button>
            </div>

            {error && <p className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

            {isLoading ? (
                <p className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600">Loading payments...</p>
            ) : visiblePayments.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
                    <p className="text-lg font-semibold">{tab === 'pending' ? 'No payments awaiting review' : 'No payments yet'}</p>
                    <p className="mt-2 text-sm">
                        {tab === 'pending'
                            ? 'Manual checkout submissions will appear here for approval.'
                            : 'Payment records will appear here after checkout or M-Pesa callbacks.'}
                    </p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200 text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Order</th>
                                <th className="px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Method</th>
                                <th className="px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Amount</th>
                                <th className="px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Reference</th>
                                <th className="px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Status</th>
                                <th className="px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Date</th>
                                {tab === 'pending' ? (
                                    <th className="px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Actions</th>
                                ) : null}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {visiblePayments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-sm text-slate-800">
                                        <div className="font-medium">#{payment.orderId.slice(0, 8)}</div>
                                        <div className="text-xs text-slate-500">{payment.order?.customerPhone ?? '—'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{payment.method}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-emerald-700">KES {Number(payment.amount ?? 0).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{payment.reference ?? payment.checkoutRequestId ?? '—'}</td>
                                    <td className="px-6 py-4 text-sm text-slate-800">{formatPaymentStatus(payment)}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{new Date(payment.createdAt).toLocaleString()}</td>
                                    {tab === 'pending' ? (
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            <div className="flex gap-2">
                                                <button
                                                    className="rounded-md bg-emerald-600 px-3 py-1 text-sm text-white"
                                                    onClick={async () => {
                                                        try {
                                                            await approveAdminPayment(payment.id);
                                                            loadPayments();
                                                            window.dispatchEvent(new CustomEvent('admin:data.updated'));
                                                        } catch (e: any) {
                                                            alert('Approve failed: ' + e.message);
                                                        }
                                                    }}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    className="rounded-md bg-rose-600 px-3 py-1 text-sm text-white"
                                                    onClick={async () => {
                                                        const note = prompt('Rejection note (optional)') || undefined;
                                                        try {
                                                            await rejectAdminPayment(payment.id, { note });
                                                            loadPayments();
                                                        } catch (e: any) {
                                                            alert('Reject failed: ' + e.message);
                                                        }
                                                    }}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    ) : null}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default Payments;
