import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatKes } from '../utils/currency';
import { useCart } from '../hooks/useCart';
import { createBulkOrders } from '../services/orderService';

function CheckoutPage() {
    const { cart, clearCart } = useCart();
    const navigate = useNavigate();
    const [phone, setPhone] = useState('');
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
            const successMessage = 'Order placed — check your phone for payment prompts (if applicable).';
            clearCart();
            navigate('/checkout-success', { state: { message: successMessage, orders: resp.data } });
        } catch (err: any) {
            setStatus('error');
            setMessage(err?.message ?? 'Unable to place order.');
        }
    }

    return (
        <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-semibold text-[#16332b]">Checkout</h1>
                <p className="mt-2 text-sm text-[#5a645d]">Enter your phone number to receive payment prompts and confirm the order.</p>
            </div>

            <div className="grid gap-10 xl:grid-cols-[1.6fr_0.9fr]">
                <div className="space-y-6">
                    <section className="rounded-[2rem] border border-[#e3e2da] bg-white p-6 shadow-sm">
                        <label className="block text-sm font-medium text-[#5a645d]">
                            Phone number
                            <input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Enter phone number"
                                className="mt-2 w-full rounded-2xl border border-[#e3e2da] bg-[#f8faf7] px-4 py-3 text-sm text-[#16332b] outline-none"
                            />
                        </label>

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
