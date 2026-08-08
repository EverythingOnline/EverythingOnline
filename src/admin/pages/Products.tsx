import { useEffect, useState } from 'react';
import ProductTable from '../components/ProductTable';
import ProductForm from '../components/ProductForm';
import { createAdminProduct, deleteAdminProduct, fetchAdminProducts, updateAdminProduct } from '../api/admin';
import type { Product } from '../../types/product';

function Products() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAdminProducts()
            .then(setProducts)
            .catch((err) => setError(err.message))
            .finally(() => setIsLoading(false));
    }, []);

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
        await deleteAdminProduct(id);
        setProducts((current) => current.filter((product) => product.id !== id));
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-semibold text-slate-900">Products</h1>
                    <p className="mt-2 text-sm text-slate-500">Manage catalog items and stock levels.</p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        setEditingProduct(null);
                        setShowForm(true);
                    }}
                    className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                    + Add Product
                </button>
            </div>

            {error && <p className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

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
                <ProductTable products={products} isLoading={isLoading} onEdit={(product) => {
                    setEditingProduct(product);
                    setShowForm(true);
                }} onDelete={handleDelete} />
            )}
        </div>
    );
}

export default Products;
