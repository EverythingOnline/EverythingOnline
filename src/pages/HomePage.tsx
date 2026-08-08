import { useEffect, useState } from 'react';
import HeroBanner from '../components/HeroBanner';
import ProductCard from '../components/ProductCard';
import ProductHero from '../components/ProductHero';
import QuickStats from '../components/QuickStats';
import { fetchProducts } from '../services/productService';
import type { Product } from '../types/product';

function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  const heroProduct = products[0];

  return (
    <div>
      <HeroBanner />

      {heroProduct && <ProductHero product={heroProduct} />}

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#6e8fa3]">Featured products</p>
            <h2 className="mt-2 font-serif text-3xl text-[#16332b]">Best sellers for busy households</h2>
          </div>
          <QuickStats />
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
