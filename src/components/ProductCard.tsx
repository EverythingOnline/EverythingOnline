import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBasket } from 'lucide-react';
import { formatKes } from '../utils/currency';
import type { Product } from '../types/product';
import { useCart } from '../hooks/useCart';

type ProductCardProps = {
    product: Product;
};

function ProductCard({ product }: ProductCardProps) {
    const { addItem } = useCart();
    const [added, setAdded] = useState(false);
    const fallbackImage = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22600%22 height=%22400%22 viewBox=%220 0 600 400%22%3E%3Crect width=%22600%22 height=%22400%22 fill=%22%23f1f4ef%22/%3E%3Ctext x=%22300%22 y=%22210%22 text-anchor=%22middle%22 fill=%22%2316332b%22 font-family=%22sans-serif%22 font-size=%2224%22%3ENo image available%3C/text%3E%3C/svg%3E';
    const compareAtPrice = Number(product.originalPrice) > product.price ? product.originalPrice : undefined;

    function handleAdd() {
        addItem(product);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1000);
    }

    return (
        <article className="group overflow-hidden rounded-[2rem] border border-[#e3e2da] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <Link to={`/product/${product.slug}`} className="block">
                <div className="relative h-64 overflow-hidden bg-[#f8faf7]">
                    <img
                        src={product.images?.[0] || fallbackImage}
                        alt={product.name}
                        onError={(event) => {
                            if (event.currentTarget.src !== fallbackImage) event.currentTarget.src = fallbackImage;
                        }}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    {compareAtPrice && <span className="absolute left-4 top-4 rounded-full bg-[#16332b]/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white">
                        {Math.round((1 - product.price / compareAtPrice) * 100)}% off
                    </span>}
                </div>
            </Link>

            <div className="space-y-4 p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6e8fa3]">{product.brand}</p>
                        <h3 className="mt-3 text-lg font-semibold text-[#16332b]">{product.name}</h3>
                    </div>
                    <p className="text-right text-sm font-semibold text-[#16332b]">{product.rating.toFixed(1)}★</p>
                </div>

                <p className="text-sm leading-6 text-[#5a645d] line-clamp-2">{product.description}</p>

                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-lg font-semibold text-[#16332b]">{formatKes(product.price)}</p>
                        {compareAtPrice && <p className="text-sm text-[#7c8a7f] line-through">{formatKes(compareAtPrice)}</p>}
                    </div>
                    <button
                        type="button"
                        onClick={handleAdd}
                        className="rounded-2xl bg-[#16332b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1e4436]"
                    >
                        <span className="inline-flex items-center gap-2"><ShoppingBasket size={16} />{added ? 'Added' : 'Add'}</span>
                    </button>
                </div>
            </div>
        </article>
    );
}

export default ProductCard;
