import { useEffect, useState, useRef, useCallback } from 'react';
import { fetchAdminPayments, approveAdminPayment, rejectAdminPayment } from '../api/admin';
import type { PaymentRecord } from '../api/admin';

function paymentStatus(resultCode: number) {
    return resultCode === 0 ? 'SUCCESS' : 'FAILED';
}

function Payments() {
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isMounted = useRef(true);
    const loadPayments = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchAdminPayments();
            if (isMounted.current) setPayments(data);
        } catch (err: any) {
            if (isMounted.current) setError(err.message);
        } finally {
            if (isMounted.current) setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        isMounted.current = true;
        loadPayments();
        const id = setInterval(loadPayments, 5000);
        const onPayment = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            loadPayments();
            window.dispatchEvent(new CustomEvent('admin:payments.notified', { detail }));
        };
        window.addEventListener('admin:payment.received', onPayment as EventListener);
        return () => {
            isMounted.current = false;
            clearInterval(id);
            window.removeEventListener('admin:payment.received', onPayment as EventListener);
        };
    }, [loadPayments]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-semibold text-slate-900">Payments</h1>
                    <p className="mt-2 text-sm text-slate-500">Review payment callbacks and transaction status.</p>
                </div>
            </div>

            {error && <p className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={() => loadPayments()}
                    className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700"
                >
                    Refresh
                </button>
            </div>

            {isLoading ? (
                <p className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600">Loading payments...</p>
            ) : payments.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
                    <p className="text-lg font-semibold">No payments yet</p>
                    <p className="mt-2 text-sm">Payment callback records will appear here.</p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200 text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">ID</th>
                                <th className="px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Request</th>
                                <th className="px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Checkout</th>
                                <th className="px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Result</th>
                                <th className="px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Date</th>
                                <th className="px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-sm text-slate-800">{payment.id}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{payment.merchantRequestId}</td>
                                    <td className="px-6 py-4 text-sm text-slate-800">{payment.checkoutRequestId}</td>
                                    <td className="px-6 py-4 text-sm text-slate-800">{paymentStatus(payment.resultCode)} ({payment.resultDesc})</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{new Date(payment.createdAt).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        <div className="flex gap-2">
                                            <button
                                                className="rounded-md bg-emerald-600 px-3 py-1 text-white text-sm"
                                                onClick={async () => {
                                                    try {
                                                        await approveAdminPayment(payment.id);
                                                        loadPayments();
                                                    } catch (e: any) {
                                                        alert('Approve failed: ' + e.message);
                                                    }
                                                }}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                className="rounded-md bg-rose-600 px-3 py-1 text-white text-sm"
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
