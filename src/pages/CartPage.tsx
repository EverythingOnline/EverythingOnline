import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatKes } from '../utils/currency';
import { useCart } from '../hooks/useCart';
import { createBulkOrders } from '../services/orderService';

function CartPage() {
    const { cart, removeItem, setQuantity, clearCart } = useCart();
    const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState<string | null>(null);
    const [customerPhone, setCustomerPhone] = useState('');

    const navigate = useNavigate();

    async function handleCheckout() {
        if (!customerPhone.trim()) {
            setStatus('error');
            setMessage('Please enter your phone number to complete checkout.');
            return;
        }

        if (cart.items.length === 0) {
            setStatus('error');
            setMessage('Your cart is empty. Add items before checking out.');
            return;
        }

        setStatus('saving');
        setMessage(null);

        try {
            const items = cart.items.map((item) => ({ productId: item.product.id, quantity: item.quantity }));
            const resp = await createBulkOrders({ items, customerPhone });
            setStatus('success');
            const successMessage = 'Thank you for shopping at EverythingOnline. You are welcome to shop here every other time.';
            setMessage(successMessage);
            clearCart();
            // navigate to success page and pass the message and created orders
            navigate('/checkout-success', { state: { message: successMessage, orders: resp.data } });
        } catch (error: any) {
            setStatus('error');
            setMessage(error?.message ?? 'Unable to place order.');
        }
    }

    if (!cart.items.length) {
        return (
            <div className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
                <h1 className="text-3xl font-semibold text-[#16332b]">Your Cart</h1>
                <p className="mt-4 text-sm text-[#5a645d]">Your cart is empty for now.</p>
                <Link
                    to="/products"
                    className="mt-8 inline-flex rounded-3xl bg-[#16332b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1e4436]"
                >
                    Browse products
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-semibold text-[#16332b]">Your cart</h1>
                    <p className="mt-2 text-sm text-[#5a645d]">Review your selections before checkout.</p>
                </div>
                <button
                    type="button"
                    onClick={clearCart}
                    className="rounded-3xl border border-[#e3e2da] bg-white px-5 py-3 text-sm font-semibold text-[#16332b] transition hover:border-[#16332b]"
                >
                    Clear cart
                </button>
            </div>

            <div className="grid gap-10 xl:grid-cols-[1.6fr_0.9fr]">
                <div className="space-y-6">
                    {cart.items.map((item) => (
                        <div key={item.product.id} className="rounded-[2rem] border border-[#e3e2da] bg-white p-6 shadow-sm">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={item.product.images[0]}
                                        alt={item.product.name}
                                        className="h-24 w-24 rounded-3xl object-cover"
                                    />
                                    <div>
                                        <h2 className="text-lg font-semibold text-[#16332b]">{item.product.name}</h2>
                                        <p className="mt-1 text-sm text-[#5a645d]">{item.product.brand}</p>
                                        <p className="mt-2 text-sm font-semibold text-[#16332b]">{formatKes(item.product.price)} each</p>
                                    </div>
                                </div>

                                <div className="grid gap-3 text-sm">
                                    <label className="flex flex-col gap-2 text-[#5a645d]">
                                        Quantity
                                        <input
                                            type="number"
                                            min={1}
                                            value={item.quantity}
                                            onChange={(event) => setQuantity(item.product.id, Number(event.target.value))}
                                            className="w-24 rounded-2xl border border-[#e3e2da] bg-[#f8faf7] px-3 py-2 text-sm text-[#16332b] outline-none"
                                        />
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => removeItem(item.product.id)}
                                        className="rounded-3xl bg-[#fee2e2] px-4 py-2 text-sm font-semibold text-[#b91c1c] transition hover:bg-[#fca5a5]"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <aside className="space-y-6 rounded-[2rem] border border-[#e3e2da] bg-white p-6 shadow-sm">
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-[#16332b]">Order summary</h2>
                        <div className="flex items-center justify-between text-sm text-[#5a645d]">
                            <span>Subtotal</span>
                            <span>{formatKes(cart.subtotal)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-[#5a645d]">
                            <span>Delivery</span>
                            <span>{formatKes(cart.total - cart.subtotal)}</span>
                        </div>
                        <div className="border-t border-[#e3e2da] pt-4 text-lg font-semibold text-[#16332b] flex items-center justify-between">
                            <span>Total</span>
                            <span>{formatKes(cart.total)}</span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-[#5a645d]">
                            Phone number
                            <input
                                type="tel"
                                value={customerPhone}
                                onChange={(event) => setCustomerPhone(event.target.value)}
                                className="mt-2 w-full rounded-2xl border border-[#e3e2da] bg-[#f8faf7] px-4 py-3 text-sm text-[#16332b] outline-none"
                                placeholder="Enter phone number"
                            />
                        </label>
                        {message && (
                            <div className={`rounded-3xl px-4 py-3 text-sm ${status === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                {message}
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        disabled={status === 'saving'}
                        onClick={handleCheckout}
                        className="w-full rounded-3xl bg-[#16332b] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#1e4436] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {status === 'saving' ? 'Placing order...' : 'Checkout now'}
                    </button>
                </aside>
            </div>
        </div>
    );
}

export default CartPage;
