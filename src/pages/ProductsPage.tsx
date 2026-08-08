import { useEffect, useMemo, useState } from 'react';
import SearchBar from '../components/SearchBar';
import CategoryList from '../components/CategoryList';
import ProductCard from '../components/ProductCard';
import { fetchCategories, fetchProducts } from '../services/productService';
import type { Product } from '../types/product';

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchProducts().then(setProducts);
    fetchCategories().then((cats) => setCategories(['All', ...cats]));
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (query && !(`${p.name} ${p.brand} ${p.description}`.toLowerCase().includes(query.toLowerCase()))) return false;
      return true;
    });
  }, [products, selectedCategory, query]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
      <div className="mb-8 grid gap-6 md:grid-cols-[1fr_300px] md:items-start">
        <div>
          <h1 className="text-3xl font-semibold text-[#16332b]">All products</h1>
          <p className="mt-2 text-sm text-[#5a645d]">Browse our dairy and plant-based product selection.</p>
        </div>
        <div>
          <SearchBar onSearch={(q) => setQuery(q)} />
        </div>
      </div>

      <div className="mb-6">
        <CategoryList categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default ProductsPage;
