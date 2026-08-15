import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { formatKes } from '../utils/currency';
import { useCart } from '../hooks/useCart';
import type { Product } from '../types/product';
import { fetchProductBySlug, fetchProducts } from '../services/productService';

function ProductPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { addItem, clearCart } = useCart();
    const [product, setProduct] = useState<Product | undefined>();
    const [related, setRelated] = useState<Product[]>([]);

    useEffect(() => {
        if (!slug) return;

        fetchProductBySlug(slug).then(setProduct);
        fetchProducts().then((allProducts) => {
            setRelated(allProducts.filter((item) => item.category === 'Milk' && item.slug !== slug).slice(0, 4));
        });
    }, [slug]);

    if (!product) {
        return (
            <div className="mx-auto max-w-6xl px-6 py-24 lg:px-8">
                <p className="text-sm text-[#5a645d]">Loading product...</p>
            </div>
        );
    }

    const handleAddToCart = () => {
        addItem(product);
    };

    const handleBuyNow = () => {
        clearCart();
        addItem(product);
        navigate('/checkout', { state: { fromBuyNow: true } });
    };

    return (
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
                <div className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        {product.images.map((image) => (
                            <div key={image} className="overflow-hidden rounded-[2rem] bg-[#f8faf7]">
                                <img src={image} alt={product.name} className="h-80 w-full object-cover transition duration-500 hover:scale-105" />
                            </div>
                        ))}
                    </div>

                    <section className="rounded-[2rem] border border-[#e3e2da] bg-white p-8 shadow-sm">
                        <h2 className="text-2xl font-semibold text-[#16332b]">Customer reviews</h2>
                        <div className="mt-6 space-y-4">
                            {product.reviews.map((review) => (
                                <div key={review.id} className="rounded-3xl bg-[#f7f7f4] p-5">
                                    <div className="flex items-center justify-between gap-4">
                                        <p className="font-semibold text-[#16332b]">{review.author}</p>
                                        <span className="text-sm text-[#5a645d]">{review.rating} ★</span>
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-[#5a645d]">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <aside className="space-y-6">
                    <div className="rounded-[2rem] border border-[#e3e2da] bg-white p-8 shadow-sm">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm uppercase tracking-[0.22em] text-[#6e8fa3]">{product.brand}</p>
                                    <h1 className="mt-3 text-4xl font-semibold text-[#16332b]">{product.name}</h1>
                                </div>
                                <span className="rounded-full bg-[#f3f7f2] px-3 py-1 text-sm font-semibold text-[#1c5139]">{product.rating} ★</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <p className="text-3xl font-semibold text-[#16332b]">{formatKes(product.price)}</p>
                                <p className="text-sm line-through text-[#7c8a7f]">{formatKes(product.originalPrice)}</p>
                            </div>

                            <p className="text-sm leading-6 text-[#5a645d]">{product.description}</p>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-3xl bg-[#f8faf7] p-4">
                                    <p className="text-xs uppercase tracking-[0.22em] text-[#6e8fa3]">Availability</p>
                                    <p className="mt-2 text-sm font-semibold text-[#16332b]">{product.stock} in stock</p>
                                </div>
                                <div className="rounded-3xl bg-[#f8faf7] p-4">
                                    <p className="text-xs uppercase tracking-[0.22em] text-[#6e8fa3]">Category</p>
                                    <p className="mt-2 text-sm font-semibold text-[#16332b]">{product.category}</p>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                <button
                                    type="button"
                                    onClick={handleAddToCart}
                                    className="w-full rounded-3xl bg-[#16332b] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#1e4436]"
                                >
                                    Add to cart
                                </button>
                                <button
                                    type="button"
                                    onClick={handleBuyNow}
                                    className="w-full rounded-3xl border border-[#16332b] bg-white px-6 py-4 text-sm font-semibold text-[#16332b] transition hover:bg-[#f7f7f4]"
                                >
                                    Buy now
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-[#e3e2da] bg-[#f9fcf8] p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-[#16332b]">Nutrition facts</h3>
                        <ul className="mt-4 space-y-3 text-sm text-[#5a645d]">
                            <li>Calories: {product.nutrition.calories}</li>
                            <li>Protein: {product.nutrition.protein}</li>
                            <li>Fat: {product.nutrition.fat}</li>
                            <li>Carbs: {product.nutrition.carbs}</li>
                        </ul>
                    </div>
                </aside>
            </div>

            <section className="mt-14">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#6e8fa3]">You may also like</p>
                        <h2 className="mt-2 text-3xl font-semibold text-[#16332b]">Related milk products</h2>
                    </div>
                </div>

                <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                    {related.map((item) => (
                        <Link
                            key={item.id}
                            to={`/product/${item.slug}`}
                            className="rounded-[2rem] border border-[#e3e2da] bg-white p-4 text-sm text-[#5a645d] transition hover:-translate-y-1 hover:shadow-md"
                        >
                            <img src={item.images[0]} alt={item.name} className="h-40 w-full rounded-[1.5rem] object-cover" />
                            <p className="mt-4 font-semibold text-[#16332b]">{item.name}</p>
                            <p className="mt-2 text-sm text-[#7c8a7f]">{formatKes(item.price)}</p>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default ProductPage;
