import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

type Payment = {
    id: string;
    orderId: string;
    method: string;
    amount: number;
    reference?: string;
    createdAt: string;
    order: any;
};

export default function PendingPayments() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [filter, setFilter] = useState<string>('');

    useEffect(() => {
        fetchPayments();
    }, [filter]);

    async function fetchPayments() {
        const q = filter ? `?method=${encodeURIComponent(filter)}` : '';
        const res = await fetch(`${API_URL}/api/admin/payments/pending${q}`, { credentials: 'include' });
        const data = await res.json();
        setPayments(data.data || []);
    }

    async function approve(id: string) {
        await fetch(`${API_URL}/api/admin/payments/${id}/approve`, { method: 'POST', credentials: 'include' });
        fetchPayments();
    }

    async function rejectPayment(id: string) {
        await fetch(`${API_URL}/api/admin/payments/${id}/reject`, { method: 'POST', credentials: 'include' });
        fetchPayments();
    }

    return (
        <div className="p-6">
            <h1 className="text-xl font-semibold">Pending Payments</h1>
            <div className="mt-4">
                <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded border px-3 py-2">
                    <option value="">All</option>
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="MANUAL_MPESA_TILL">M-Pesa Till</option>
                </select>
            </div>

            <div className="mt-6 space-y-4">
                {payments.map((p) => (
                    <div key={p.id} className="rounded border p-4">
                        <div className="flex justify-between">
                            <div>
                                <div className="font-semibold">{p.method}</div>
                                <div className="text-sm text-gray-600">Order: {p.orderId} • Amount: KES {p.amount}</div>
                                <div className="text-sm text-gray-600">Reference: {p.reference}</div>
                                <div className="text-sm text-gray-600">Customer: {p.order?.user?.email ?? 'Guest'}</div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => approve(p.id)} className="rounded bg-emerald-600 px-4 py-2 text-white">Approve</button>
                                <button onClick={() => rejectPayment(p.id)} className="rounded bg-rose-600 px-4 py-2 text-white">Reject</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
