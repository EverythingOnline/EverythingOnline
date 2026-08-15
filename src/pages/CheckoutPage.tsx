import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatKes } from '../utils/currency';
import { useCart } from '../hooks/useCart';
import { createBulkOrders, initiateMpesaCheckout, getMpesaPaymentStatus, submitManualPayment } from '../services/orderService';

function CheckoutPage() {
    const { cart, clearCart } = useCart();
    const location = useLocation();
    const navigate = useNavigate();
    const [phone, setPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'automatic' | 'manual'>('automatic');
    const [mpesaCheckoutId, setMpesaCheckoutId] = useState<string | null>(null);
    const [polling, setPolling] = useState(false);
    const [manualMethod, setManualMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'MANUAL_MPESA_TILL'>('CASH');
    const [manualReference, setManualReference] = useState('');

    const fromBuyNow = (location.state as { fromBuyNow?: boolean } | null)?.fromBuyNow;
    const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState<string | null>(null);

    const subtotal = cart.subtotal;
    const total = cart.total;

    async function handlePlaceOrder() {
        if (!phone.trim()) {
            setStatus('error');
            setMessage('Please enter your phone number to complete checkout.');
            return;
        }

        if (cart.items.length === 0) {
            setStatus('error');
            setMessage('Your cart is empty.');
            return;
        }

        setStatus('saving');
        setMessage(null);

        try {
            const items = cart.items.map((it) => ({ productId: it.product.id, quantity: it.quantity }));
            const resp = await createBulkOrders({ items, customerPhone: phone });
            setStatus('success');
            const createdOrders = resp.data as any[];
            clearCart();

            // If automatic M-Pesa, initiate STK push for the first order
            if (paymentMethod === 'automatic') {
                const firstOrder = createdOrders[0];
                const amount = firstOrder.total ?? 0;
                const init = await initiateMpesaCheckout({ orderId: firstOrder.id, phoneNumber: phone, amount });
                const checkoutId = init.CheckoutRequestID ?? init.checkoutRequestId ?? null;
                if (checkoutId) {
                    setMpesaCheckoutId(checkoutId);
                    setPolling(true);
                    // poll status every 5s
                    const interval = setInterval(async () => {
                        try {
                            const st = await getMpesaPaymentStatus(checkoutId);
                            const statusStr = st.data?.status;
                            if (statusStr === 'CONFIRMED') {
                                clearInterval(interval);
                                setPolling(false);
                                navigate('/checkout-success', { state: { message: 'Payment confirmed', orders: createdOrders } });
                            } else if (statusStr === 'FAILED' || statusStr === 'EXPIRED') {
                                clearInterval(interval);
                                setPolling(false);
                                setMessage('Payment failed or expired.');
                            }
                        } catch (e) {
                            // ignore transient polling errors
                        }
                    }, 5000);
                } else {
                    navigate('/checkout-success', { state: { message: 'Order placed — awaiting payment', orders: createdOrders } });
                }
            } else {
                // manual flow: create a manual payment and show awaiting review
                const created = createdOrders[0];
                await submitManualPayment({ orderId: created.id, method: manualMethod, reference: manualReference, amount: created.total });
                navigate('/checkout-success', { state: { message: 'Payment submitted, awaiting confirmation', orders: createdOrders } });
            }
        } catch (err: any) {
            setStatus('error');
            setMessage(err?.message ?? 'Unable to place order.');
        }
    }

    useEffect(() => {
        return () => {
            setPolling(false);
        };
    }, []);

    if (cart.items.length === 0) {
        return (
            <div className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
                <h1 className="text-3xl font-semibold text-[#16332b]">Checkout</h1>
                <p className="mt-4 text-sm text-[#5a645d]">Your cart is empty. Add a product first or choose a product and buy now.</p>
                <button
                    type="button"
                    onClick={() => navigate('/products')}
                    className="mt-8 inline-flex rounded-3xl bg-[#16332b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1e4436]"
                >
                    Browse products
                </button>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-semibold text-[#16332b]">{fromBuyNow ? 'Quick checkout' : 'Checkout'}</h1>
                <p className="mt-2 text-sm text-[#5a645d]">
                    {fromBuyNow
                        ? 'Complete your purchase in a few seconds. Enter your phone number to receive payment prompts.'
                        : 'Enter your phone number to receive payment prompts and confirm the order.'}
                </p>
            </div>

            <div className="grid gap-10 xl:grid-cols-[1.6fr_0.9fr]">
                <div className="space-y-6">
                    <section className="rounded-[2rem] border border-[#e3e2da] bg-white p-6 shadow-sm">
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-[#5a645d]">
                                Payment method
                                <div className="mt-2 flex gap-3">
                                    <button type="button" onClick={() => setPaymentMethod('automatic')} className={`px-4 py-2 rounded-2xl ${paymentMethod === 'automatic' ? 'bg-[#16332b] text-white' : 'bg-[#f1f5f2]'}`}>Pay with M-Pesa (Automatic)</button>
                                    <button type="button" onClick={() => setPaymentMethod('manual')} className={`px-4 py-2 rounded-2xl ${paymentMethod === 'manual' ? 'bg-[#16332b] text-white' : 'bg-[#f1f5f2]'}`}>Pay Manually</button>
                                </div>
                            </label>

                            {paymentMethod === 'automatic' && (
                                <label className="block text-sm font-medium text-[#5a645d]">
                                    Phone number
                                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter phone number" className="mt-2 w-full rounded-2xl border border-[#e3e2da] bg-[#f8faf7] px-4 py-3 text-sm text-[#16332b] outline-none" />
                                </label>
                            )}

                            {paymentMethod === 'manual' && (
                                <div className="space-y-3">
                                    <label className="block text-sm">
                                        Method
                                        <select value={manualMethod} onChange={(e) => setManualMethod(e.target.value as any)} className="mt-2 w-full rounded-2xl border px-3 py-2">
                                            <option value="CASH">Cash on Delivery</option>
                                            <option value="BANK_TRANSFER">Bank Transfer</option>
                                            <option value="MANUAL_MPESA_TILL">M-Pesa Till (Manual)</option>
                                        </select>
                                    </label>
                                    <label className="block text-sm">
                                        Reference (optional)
                                        <input value={manualReference} onChange={(e) => setManualReference(e.target.value)} placeholder="Enter transaction reference" className="mt-2 w-full rounded-2xl border px-3 py-2" />
                                    </label>
                                </div>
                            )}

                            {mpesaCheckoutId && (
                                <div className="mt-2 text-sm text-[#5a645d]">Waiting for payment confirmation... (Checkout ID: {mpesaCheckoutId})</div>
                            )}
                        </div>

                        {message && (
                            <div className={`mt-4 rounded-3xl px-4 py-3 text-sm ${status === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                {message}
                            </div>
                        )}

                        <div className="mt-6 grid gap-3">
                            <button
                                type="button"
                                onClick={handlePlaceOrder}
                                disabled={status === 'saving'}
                                className="w-full rounded-3xl bg-[#16332b] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#1e4436] disabled:opacity-50"
                            >
                                {status === 'saving' ? 'Placing order…' : 'Place order'}
                            </button>
                        </div>
                    </section>
                </div>

                <aside className="space-y-6 rounded-[2rem] border border-[#e3e2da] bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-[#16332b]">Order summary</h2>
                    <div className="space-y-2">
                        {cart.items.map((it) => (
                            <div key={it.product.id} className="flex items-center justify-between text-sm text-[#5a645d]">
                                <div>{it.product.name} × {it.quantity}</div>
                                <div className="font-semibold text-[#16332b]">{formatKes(it.product.price * it.quantity)}</div>
                            </div>
                        ))}
                    </div>
                    <div className="border-t pt-4">
                        <div className="flex items-center justify-between text-sm text-[#5a645d]">
                            <span>Subtotal</span>
                            <span>{formatKes(subtotal)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-[#5a645d]">
                            <span>Delivery</span>
                            <span>{formatKes(total - subtotal)}</span>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-lg font-semibold text-[#16332b]">
                            <span>Total</span>
                            <span>{formatKes(total)}</span>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default CheckoutPage;
