import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatKes } from '../utils/currency';
import { useCart } from '../hooks/useCart';

function CartPage() {
    const { cart, removeItem, setQuantity, clearCart } = useCart();
    const [savedItems, setSavedItems] = useState<string[]>([]);
    const [promoCode, setPromoCode] = useState('');
    const [promoMessage, setPromoMessage] = useState('');
    const navigate = useNavigate();
    const deliveryFee = cart.subtotal >= 500 ? 0 : 150;
    const total = cart.subtotal + deliveryFee;

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
                                    <div className="flex items-center gap-3 text-sm text-[#5a645d]">
                                        <span>Quantity</span>
                                        <div className="flex items-center rounded-2xl border border-[#e3e2da] bg-[#f8faf7]">
                                            <button type="button" onClick={() => setQuantity(item.product.id, item.quantity - 1)} className="px-3 py-2 text-lg">-</button>
                                            <span className="min-w-8 text-center text-[#16332b]">{item.quantity}</span>
                                            <button type="button" onClick={() => setQuantity(item.product.id, item.quantity + 1)} className="px-3 py-2 text-lg">+</button>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => setSavedItems([...savedItems, item.product.id])} className="text-left text-sm font-semibold text-[#28704b]">{savedItems.includes(item.product.id) ? 'Saved for later' : 'Save for later'}</button>
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
                            <span>{deliveryFee ? formatKes(deliveryFee) : 'Free'}</span>
                        </div>
                        {cart.subtotal < 500 && <p className="rounded-2xl bg-[#edf8ef] px-3 py-2 text-xs font-medium text-[#28704b]">Add {formatKes(500 - cart.subtotal)} more for free delivery!</p>}
                        <div className="border-t border-[#e3e2da] pt-4 text-lg font-semibold text-[#16332b] flex items-center justify-between">
                            <span>Total</span>
                            <span>{formatKes(total)}</span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/checkout')}
                        className="w-full rounded-3xl bg-[#16332b] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#1e4436] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Proceed to Checkout
                    </button>
                    <p className="text-center text-xs text-[#718078]">Secure 256-bit SSL checkout</p>
                    <div className="mt-6 border-t border-[#e3e2da] pt-5">
                        <label className="text-sm font-medium text-[#5a645d]">Promo code<input value={promoCode} onChange={(event) => setPromoCode(event.target.value)} className="mt-2 w-full rounded-2xl border border-[#e3e2da] bg-[#f8faf7] px-4 py-3 text-sm text-[#16332b] outline-none" placeholder="Enter code" /></label>
                        <button type="button" onClick={() => setPromoMessage(promoCode ? 'Promo codes will be applied at checkout.' : 'Enter a promo code first.')} className="mt-2 rounded-full border border-[#28704b] px-4 py-2 text-xs font-semibold text-[#28704b]">Apply</button>
                        {promoMessage && <p className="mt-2 text-xs text-[#28704b]">{promoMessage}</p>}
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default CartPage;
