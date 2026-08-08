import { formatKes } from '../utils/currency';
import type { CartItem } from '../types/cart';

type CartDrawerProps = {
    items: CartItem[];
    subtotal: number;
    total: number;
    onClose: () => void;
};

function CartDrawer({ items, subtotal, total, onClose }: CartDrawerProps) {
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
                        <div key={item.product.id} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <img src={item.product.images[0]} alt={item.product.name} className="h-14 w-14 rounded-lg object-cover" />
                                <div>
                                    <p className="font-semibold text-[#16332b]">{item.product.name}</p>
                                    <p className="text-sm text-[#7c8a7f]">{item.quantity} × {formatKes(item.product.price)}</p>
                                </div>
                            </div>
                            <div className="text-sm font-semibold text-[#16332b]">{formatKes(item.product.price * item.quantity)}</div>
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
                    <button className="w-full rounded-3xl bg-[#16332b] px-6 py-3 text-sm font-semibold text-white">Checkout</button>
                    <button className="w-full rounded-3xl border border-[#16332b] bg-white px-6 py-3 text-sm font-semibold text-[#16332b]">Continue shopping</button>
                </div>
            </div>
        </aside>
    );
}

export default CartDrawer;
