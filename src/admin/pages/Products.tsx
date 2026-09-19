import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import ProductTable from '../components/ProductTable';
import { fetchAdminProducts, removeAdminProduct, restoreAdminProduct, type AdminProduct } from '../api/admin';

function Products() {
    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<'active' | 'removed'>('active');
    const location = useLocation();
    const success = (location.state as { success?: string } | null)?.success;

    const loadProducts = () => {
        setIsLoading(true);
        fetchAdminProducts()
            .then(setProducts)
            .catch((err: Error) => setError(err.message))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const visibleProducts = useMemo(
        () => products.filter((product) => (statusFilter === 'active' ? product.active : !product.active)),
        [products, statusFilter],
    );

    const handleRemove = async (id: string) => {
        if (!window.confirm('Remove this product from the storefront?')) return;
        try {
            await removeAdminProduct(id);
            loadProducts();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to remove product.');
        }
    };

    const handleRestore = async (id: string) => {
        try {
            await restoreAdminProduct(id);
            loadProducts();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to restore product.');
        }
    };

    return <div className="space-y-6">
        <div className="flex items-center justify-between gap-4"><h1 className="text-3xl font-bold text-slate-900">Products</h1><Link to="/admin/products/new" className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:bg-emerald-600"><Plus className="h-4 w-4" /> Add Product</Link></div>
        {success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}
        {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            {(['active', 'removed'] as const).map((filter) => (
                <button
                    key={filter}
                    type="button"
                    onClick={() => setStatusFilter(filter)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition ${statusFilter === filter ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                    {filter === 'active' ? 'Active' : 'Removed'}
                </button>
            ))}
        </div>
        <ProductTable products={visibleProducts} isLoading={isLoading} onRemove={handleRemove} onRestore={handleRestore} />
    </div>;
}

export default Products;
