import { formatKes } from '../utils/currency';
import type { CartItem } from '../types/cart';

type CartDrawerProps = {
    items: CartItem[];
    subtotal: number;
    total: number;
    onClose: () => void;
    onRemoveItem: (productId: string) => void;
    onSetQuantity: (productId: string, quantity: number) => void;
    onCheckout: () => void;
};

function CartDrawer({ items, subtotal, total, onClose, onRemoveItem, onSetQuantity, onCheckout }: CartDrawerProps) {
    return (
        <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-[#e3e2da] bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#16332b]">Your cart</h3>
                <button onClick={onClose} className="text-sm text-[#5a645d]">Close</button>
            </div>

            <div className="mt-6 space-y-4">
                {items.length === 0 ? (
                    <p className="text-sm text-[#5a645d]">Your cart is empty.</p>
                ) : (
                    items.map((item) => (
                        <div key={item.product.id} className="rounded-[1.5rem] border border-[#e3e2da] bg-[#f8faf7] p-4">
                            <div className="flex items-start gap-4">
                                <img src={item.product.images[0]} alt={item.product.name} className="h-16 w-16 rounded-2xl object-cover" />
                                <div className="flex-1">
                                    <p className="font-semibold text-[#16332b]">{item.product.name}</p>
                                    <p className="mt-1 text-sm text-[#7c8a7f]">{formatKes(item.product.price)} each</p>
                                    <div className="mt-3 flex items-center gap-3">
                                        <label className="flex items-center gap-2 text-sm text-[#5a645d]">
                                            Qty
                                            <input
                                                type="number"
                                                min={1}
                                                value={item.quantity}
                                                onChange={(event) => onSetQuantity(item.product.id, Number(event.target.value))}
                                                className="w-20 rounded-2xl border border-[#d7dbd2] bg-white px-3 py-2 text-sm text-[#16332b] outline-none"
                                            />
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => onRemoveItem(item.product.id)}
                                            className="rounded-2xl bg-[#fee2e2] px-3 py-2 text-xs font-semibold text-[#b91c1c] transition hover:bg-[#fca5a5]"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                                <div className="text-sm font-semibold text-[#16332b]">{formatKes(item.product.price * item.quantity)}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-6 border-t pt-4">
                <div className="flex items-center justify-between text-sm text-[#5a645d]">
                    <span>Subtotal</span>
                    <span>{formatKes(subtotal)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-[#5a645d]">
                    <span>Delivery</span>
                    <span>{formatKes(total - subtotal)}</span>
                </div>
                <div className="mt-4 flex items-center justify-between text-lg font-semibold text-[#16332b]">
                    <span>Total</span>
                    <span>{formatKes(total)}</span>
                </div>

                <div className="mt-6 grid gap-3">
                    <button
                        type="button"
                        onClick={onCheckout}
                        className="w-full rounded-3xl bg-[#16332b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1e4436]"
                    >
                        Checkout
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full rounded-3xl border border-[#16332b] bg-white px-6 py-3 text-sm font-semibold text-[#16332b] transition hover:bg-[#f7f7f4]"
                    >
                        Continue shopping
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default CartDrawer;
