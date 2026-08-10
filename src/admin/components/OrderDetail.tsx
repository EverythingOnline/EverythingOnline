import { useEffect, useState } from 'react';
import { fetchAdminOrder, finalizeOrderCheckout, recordManualPayment, type AdminOrder } from '../api/admin';

type OrderDetailProps = {
    orderId: string;
    onClose: () => void;
};

function OrderDetail({ orderId, onClose }: OrderDetailProps) {
    const [order, setOrder] = useState<AdminOrder | null>(null);
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [paymentReference, setPaymentReference] = useState('');
    const [amountReceived, setAmountReceived] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        async function load() {
            try {
                const data = await fetchAdminOrder(orderId);
                if (isMounted) {
                    setOrder(data);
                    setAmountReceived(String(data.total));
                }
            } catch (err: any) {
                if (isMounted) setError(err.message);
            }
        }

        load();
        return () => {
            isMounted = false;
        };
    }, [orderId]);

    async function handleManualPayment(event: React.FormEvent) {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const updatedOrder = await recordManualPayment(orderId, {
                paymentMethod,
                amountReceived: Number(amountReceived || 0),
                paymentReference: paymentReference || undefined,
            });
            setOrder(updatedOrder);
            setSuccess('Manual payment recorded successfully.');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleFinalizeCheckout() {
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const updatedOrder = await finalizeOrderCheckout(orderId);
            setOrder(updatedOrder);
            setSuccess('Checkout finalized successfully.');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    if (!order) {
        return <p className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading order...</p>;
    }

    const canRecordManualPayment = order.paymentStatus !== 'SUCCESSFUL' && order.paymentStatus !== 'PAID';
    const canFinalizeCheckout = order.status === 'PENDING';

    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Order #{order.id}</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">{order.customerPhone}</h2>
                </div>
                <button type="button" onClick={onClose} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm text-slate-700">
                    Close
                </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-500">Status</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{order.status}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-500">Payment</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{order.paymentStatus} • {order.paymentMethod}</p>
                </div>
            </div>

            {error ? <p className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
            {success ? <p className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p> : null}

            <div className="mt-8 flex flex-wrap gap-3">
                {canRecordManualPayment ? (
                    <button
                        type="button"
                        onClick={() => setSuccess(null)}
                        className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                    >
                        Record manual payment
                    </button>
                ) : null}
                {canFinalizeCheckout ? (
                    <button type="button" onClick={handleFinalizeCheckout} disabled={isSubmitting} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
                        Complete checkout
                    </button>
                ) : null}
            </div>

            {canRecordManualPayment ? (
                <form onSubmit={handleManualPayment} className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="text-sm font-medium text-slate-700">
                            Payment method
                            <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className="mt-2 block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900">
                                <option value="CASH">Cash</option>
                                <option value="BANK_TRANSFER">Bank Transfer</option>
                                <option value="MPESA_TILL">M-Pesa Till/Manual</option>
                            </select>
                        </label>
                        <label className="text-sm font-medium text-slate-700">
                            Amount received
                            <input type="number" value={amountReceived} onChange={(event) => setAmountReceived(event.target.value)} className="mt-2 block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900" />
                        </label>
                    </div>
                    <label className="mt-4 block text-sm font-medium text-slate-700">
                        Reference / note
                        <input type="text" value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)} className="mt-2 block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900" placeholder="Receipt number, till number, transfer code" />
                    </label>
                    <button type="submit" disabled={isSubmitting} className="mt-4 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
                        {isSubmitting ? 'Saving...' : 'Save manual payment'}
                    </button>
                </form>
            ) : null}
        </div>
    );
}

export default OrderDetail;
