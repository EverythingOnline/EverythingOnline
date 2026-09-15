import { useMemo, useState } from 'react';
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
    const [manualMethod, setManualMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'MANUAL_MPESA_TILL'>('CASH');
    const [manualReference, setManualReference] = useState('');
    const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState<string | null>(null);

    const fromBuyNow = (location.state as { fromBuyNow?: boolean } | null)?.fromBuyNow;
    const deliveryFee = useMemo(() => Math.max(cart.total - cart.subtotal, 0), [cart.subtotal, cart.total]);

    async function handlePlaceOrder() {
        if (!phone.trim() && paymentMethod === 'automatic') {
            setStatus('error');
            setMessage('Please enter your phone number to receive the M-Pesa prompt.');
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
            const resp = await createBulkOrders({ items, customerPhone: phone || '000000000' });
            const createdOrders = resp.data as any[];
            clearCart();

            if (paymentMethod === 'automatic') {
                const firstOrder = createdOrders[0];
                const amount = Number(firstOrder.total ?? cart.total);
                const init = await initiateMpesaCheckout({ orderId: firstOrder.id, phoneNumber: phone, amount });
                const checkoutId = init.CheckoutRequestID ?? init.checkoutRequestId ?? null;

                if (checkoutId) {
                    setMpesaCheckoutId(checkoutId);
                    const interval = setInterval(async () => {
                        try {
                            const st = await getMpesaPaymentStatus(checkoutId);
                            const statusStr = st.data?.status;
                            if (statusStr === 'CONFIRMED') {
                                clearInterval(interval);
                                navigate('/checkout-success', { state: { message: 'Payment confirmed', orders: createdOrders } });
                            } else if (statusStr === 'FAILED' || statusStr === 'EXPIRED') {
                                clearInterval(interval);
                                setStatus('error');
                                setMessage('Payment failed or expired. Please try again.');
                            }
                        } catch {
                            // Ignore transient status polling failures while waiting for callback confirmation.
                        }
                    }, 5000);
                    setStatus('success');
                    setMessage('Order created. Please approve the M-Pesa prompt on your phone to complete payment.');
                    return;
                }

                navigate('/checkout-success', { state: { message: 'Order placed — awaiting payment', orders: createdOrders } });
                return;
            }

            const created = createdOrders[0];
            await submitManualPayment({
                orderId: created.id,
                method: manualMethod,
                reference: manualReference,
                amount: created.total,
            });

            navigate('/checkout-success', {
                state: { message: 'Payment submitted, awaiting confirmation', orders: createdOrders },
            });
        } catch (err: any) {
            setStatus('error');
            setMessage(err?.message ?? 'Unable to place order.');
        }
    }

    if (cart.items.length === 0) {
        return (
            <div className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
                <div className="rounded-[2rem] border border-[#dfe6df] bg-white p-10 text-center shadow-sm">
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#4f6f63]">Checkout</p>
                    <h1 className="mt-4 text-3xl font-semibold text-[#16332b]">Your cart is empty</h1>
                    <p className="mt-3 text-sm text-[#5a645d]">Add fresh groceries or essentials before continuing to checkout.</p>
                    <button
                        type="button"
                        onClick={() => navigate('/products')}
                        className="mt-8 inline-flex rounded-full bg-[#16332b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1e4436]"
                    >
                        Browse products
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
            <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#4f6f63]">Checkout</p>
                    <h1 className="mt-2 text-3xl font-semibold text-[#16332b]">{fromBuyNow ? 'Quick checkout' : 'Complete your order'}</h1>
                </div>
                <div className="rounded-full border border-[#dfe6df] bg-[#f4f7f3] px-4 py-2 text-xs font-medium text-[#486356]">
                    {cart.items.length} item{cart.items.length > 1 ? 's' : ''}
                </div>
            </div>

            <div className="grid gap-8 xl:grid-cols-[1.45fr_0.9fr]">
                <section className="rounded-[2rem] border border-[#e3e2da] bg-white p-6 shadow-[0_14px_40px_rgba(22,51,43,0.06)] lg:p-8">
                    <div className="mb-6 flex gap-3 rounded-[1.5rem] bg-[#f4f7f3] p-2">
                        <button
                            type="button"
                            onClick={() => setPaymentMethod('automatic')}
                            className={`flex-1 rounded-[1.1rem] px-4 py-3 text-sm font-semibold transition ${paymentMethod === 'automatic'
                                    ? 'bg-[#16332b] text-white shadow-sm'
                                    : 'text-[#38564c] hover:bg-white'
                                }`}
                        >
                            M-Pesa automatic
                        </button>
                        <button
                            type="button"
                            onClick={() => setPaymentMethod('manual')}
                            className={`flex-1 rounded-[1.1rem] px-4 py-3 text-sm font-semibold transition ${paymentMethod === 'manual'
                                    ? 'bg-[#16332b] text-white shadow-sm'
                                    : 'text-[#38564c] hover:bg-white'
                                }`}
                        >
                            Manual payment
                        </button>
                    </div>

                    {paymentMethod === 'automatic' ? (
                        <div className="space-y-5">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[#3d4f49]">Phone number</label>
                                <input
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="e.g. 254712345678"
                                    className="w-full rounded-[1.3rem] border border-[#dfe6df] bg-[#f8faf7] px-4 py-3.5 text-sm text-[#16332b] outline-none transition focus:border-[#16332b] focus:ring-2 focus:ring-[#dbeae0]"
                                />
                            </div>
                            <div className="rounded-[1.5rem] border border-[#dfe6df] bg-[#f5f9f4] p-4 text-sm text-[#49655f]">
                                You will receive a Safaricom STK push prompt to complete the payment. Once the callback succeeds, the order is marked paid and appears in the admin dashboard automatically.
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[#3d4f49]">Payment method</label>
                                <select
                                    value={manualMethod}
                                    onChange={(e) => setManualMethod(e.target.value as 'CASH' | 'BANK_TRANSFER' | 'MANUAL_MPESA_TILL')}
                                    className="w-full rounded-[1.3rem] border border-[#dfe6df] bg-[#f8faf7] px-4 py-3.5 text-sm text-[#16332b] outline-none transition focus:border-[#16332b] focus:ring-2 focus:ring-[#dbeae0]"
                                >
                                    <option value="CASH">Cash on delivery</option>
                                    <option value="BANK_TRANSFER">Bank transfer</option>
                                    <option value="MANUAL_MPESA_TILL">M-Pesa till</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[#3d4f49]">Reference</label>
                                <input
                                    value={manualReference}
                                    onChange={(e) => setManualReference(e.target.value)}
                                    placeholder="Transaction reference or note"
                                    className="w-full rounded-[1.3rem] border border-[#dfe6df] bg-[#f8faf7] px-4 py-3.5 text-sm text-[#16332b] outline-none transition focus:border-[#16332b] focus:ring-2 focus:ring-[#dbeae0]"
                                />
                            </div>
                        </div>
                    )}

                    {mpesaCheckoutId && (
                        <div className="mt-5 rounded-[1.2rem] border border-[#dbeae0] bg-[#ecf8f0] p-3 text-sm text-[#234d3f]">
                            Waiting for payment confirmation... Checkout ID: <span className="font-semibold">{mpesaCheckoutId}</span>
                        </div>
                    )}

                    {message && (
                        <div
                            className={`mt-5 rounded-[1.2rem] border px-4 py-3 text-sm ${status === 'success'
                                    ? 'border-[#d4eadb] bg-[#edf9f1] text-[#1b5e43]'
                                    : status === 'error'
                                        ? 'border-[#f3d7d6] bg-[#fff0f0] text-[#8f2c2c]'
                                        : 'border-[#dfe6df] bg-[#f5f7f4] text-[#39584f]'
                                }`}
                        >
                            {message}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handlePlaceOrder}
                        disabled={status === 'saving'}
                        className="mt-6 w-full rounded-full bg-[#16332b] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#1e4436] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {status === 'saving' ? 'Placing order...' : 'Place order'}
                    </button>
                </section>

                <aside className="rounded-[2rem] border border-[#e3e2da] bg-white p-6 shadow-[0_14px_40px_rgba(22,51,43,0.06)] lg:p-8">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-[#16332b]">Order summary</h2>
                        <span className="rounded-full bg-[#edf6ee] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#41715d]">
                            {cart.items.length} items
                        </span>
                    </div>

                    <div className="space-y-4">
                        {cart.items.map((item) => (
                            <div key={item.product.id} className="flex items-center gap-3 rounded-[1.2rem] bg-[#f9faf8] p-3">
                                <img src={item.product.images[0]} alt={item.product.name} className="h-16 w-16 rounded-[1rem] object-cover" />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="line-clamp-2 text-sm font-medium text-[#16332b]">{item.product.name}</p>
                                        <span className="text-sm font-semibold text-[#16332b]">{formatKes(item.product.price * item.quantity)}</span>
                                    </div>
                                    <p className="mt-1 text-xs text-[#61756f]">
                                        {item.quantity} × {formatKes(item.product.price)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 space-y-3 border-t border-[#edf0ed] pt-5 text-sm text-[#5a645d]">
                        <div className="flex items-center justify-between">
                            <span>Subtotal</span>
                            <span>{formatKes(cart.subtotal)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Delivery fee</span>
                            <span>{formatKes(deliveryFee)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Service</span>
                            <span>{formatKes(0)}</span>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between rounded-[1.3rem] bg-[#16332b] p-4 text-white">
                        <span className="text-sm font-medium text-[#dfeae4]">Total</span>
                        <span className="text-xl font-semibold">{formatKes(cart.total)}</span>
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default CheckoutPage;
