import { Link } from 'react-router-dom';
import { formatKes } from '../utils/currency';
import type { Product } from '../types/product';

type ProductCardProps = {
    product: Product;
};

function ProductCard({ product }: ProductCardProps) {
    return (
        <article className="group overflow-hidden rounded-[2rem] border border-[#e3e2da] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <Link to={`/product/${product.slug}`} className="block">
                <div className="relative h-64 overflow-hidden bg-[#f8faf7]">
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <span className="absolute left-4 top-4 rounded-full bg-[#16332b]/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white">
                        {product.discount}% off
                    </span>
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
                        <p className="text-sm text-[#7c8a7f] line-through">{formatKes(product.originalPrice)}</p>
                    </div>
                    <Link
                        to={`/product/${product.slug}`}
                        className="rounded-2xl bg-[#16332b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1e4436]"
                    >
                        View
                    </Link>
                </div>
            </div>
        </article>
    );
}

export default ProductCard;
