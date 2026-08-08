import { Link } from 'react-router-dom';
import type { Product } from '../types/product';

type ProductHeroProps = {
    product: Product;
};

function ProductHero({ product }: ProductHeroProps) {
    return (
        <section className="rounded-[2.5rem] border border-[#e3e2da] bg-white px-6 py-10 shadow-[0_20px_60px_-30px_rgb(22,51,43,0.15)] sm:px-10">
            <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
                <div className="space-y-6">
                    <p className="inline-block rounded-full bg-[#e6f1ec] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#1c5139]">
                        Creamy favorites
                    </p>
                    <h2 className="max-w-xl text-4xl font-semibold tracking-tight text-[#16332b] sm:text-5xl">
                        Fresh milk essentials and pantry-ready blends for every day.
                    </h2>
                    <p className="max-w-2xl text-sm leading-7 text-[#5a645d]">
                        Discover a curated selection of premium milk products, single origin bottles, and specialty dairy blends designed for families, coffee makers, and healthy lifestyles.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Link
                            to={`/product/${product.slug}`}
                            className="inline-flex items-center justify-center rounded-3xl bg-[#16332b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1e4436]"
                        >
                            Shop best seller
                        </Link>
                        <Link
                            to="/products"
                            className="inline-flex items-center justify-center rounded-3xl border border-[#16332b] bg-white px-6 py-3 text-sm font-semibold text-[#16332b] transition hover:bg-[#f7f7f4]"
                        >
                            Browse all milk
                        </Link>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[2rem] bg-[#f3f3ee] p-5">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6e8fa3]">Top seller</p>
                        <p className="mt-3 text-lg font-semibold text-[#16332b]">{product.name}</p>
                        <p className="mt-2 text-sm leading-6 text-[#5a645d]">{product.description}</p>
                    </div>
                    <div className="rounded-[2rem] bg-[#f3f3ee] p-5">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6e8fa3]">Fast delivery</p>
                        <p className="mt-3 text-lg font-semibold text-[#16332b]">Next-day dispatch</p>
                        <p className="mt-2 text-sm leading-6 text-[#5a645d]">Delivered fresh with temperature-safe packaging.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ProductHero;
