import { useEffect, useMemo, useState } from 'react';
import { Search, Plus } from 'lucide-react';
import ProductTable from '../components/ProductTable';
import ProductForm from '../components/ProductForm';
import { createAdminProduct, deleteAdminProduct, fetchAdminProducts, updateAdminProduct } from '../api/admin';
import type { Product } from '../../types/product';

function Products() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAdminProducts()
            .then(setProducts)
            .catch((err) => setError(err.message))
            .finally(() => setIsLoading(false));
    }, []);

    const filteredProducts = useMemo(
        () =>
            products.filter((product) =>
                `${product.name} ${product.brand} ${product.category}`.toLowerCase().includes(search.toLowerCase()),
            ),
        [products, search],
    );

    async function handleSave(product: Partial<Product>) {
        try {
            setError(null);
            const saved = editingProduct ? await updateAdminProduct(editingProduct.id, product) : await createAdminProduct(product);
            setProducts((current) => {
                if (editingProduct) {
                    return current.map((item) => (item.id === editingProduct.id ? saved : item));
                }
                return [saved, ...current];
            });
            setShowForm(false);
            setEditingProduct(null);
        } catch (err: any) {
            setError(err.message);
        }
    }

    async function handleDelete(id: string) {
        try {
            await deleteAdminProduct(id);
            setProducts((current) => current.filter((product) => product.id !== id));
        } catch (err: any) {
            setError(err.message);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-slate-900">Products</h1>
                <button
                    type="button"
                    onClick={() => {
                        setEditingProduct(null);
                        setShowForm(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:bg-emerald-600"
                >
                    <Plus className="h-4 w-4" />
                    Add Product
                </button>
            </div>

            {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

            {!showForm && (
                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm shadow-slate-200/60">
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                        <Search className="h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="w-full border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                        />
                    </div>
                </div>
            )}

            {showForm ? (
                <ProductForm
                    product={editingProduct ?? undefined}
                    onSave={handleSave}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingProduct(null);
                    }}
                />
            ) : (
                <ProductTable
                    products={filteredProducts}
                    isLoading={isLoading}
                    onEdit={(product) => {
                        setEditingProduct(product);
                        setShowForm(true);
                    }}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
}

export default Products;
