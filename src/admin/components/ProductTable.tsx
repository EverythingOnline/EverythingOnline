import { Link } from 'react-router-dom';
import type { AdminProduct } from '../api/admin';

function ProductTable({
    products,
    isLoading,
    onRemove,
    onRestore,
}: {
    products: AdminProduct[];
    isLoading: boolean;
    onRemove?: (id: string) => Promise<void> | void;
    onRestore?: (id: string) => Promise<void> | void;
}) {
    if (isLoading) return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">Loading products...</div>;
    if (!products.length) return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600 shadow-sm">No products yet.</div>;

    return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60"><table className="min-w-full text-left">
        <thead className="bg-slate-50"><tr>{['Product', 'Price', 'Stock', 'Category', 'Status', 'Actions'].map((heading) => <th key={heading} className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{heading}</th>)}</tr></thead>
        <tbody className="divide-y divide-slate-200">{products.map((product) => {
            const stockState = product.stock === 0 ? 'Out of stock' : product.stock <= product.lowStockThreshold ? 'Low stock' : 'Healthy';
            return <tr key={product.id} className="hover:bg-slate-50/80">
                <td className="px-5 py-4"><div className="flex items-center gap-3"><img src={product.imageUrl || '/placeholder-product.png'} alt={product.name} className="h-12 w-12 rounded-xl object-cover" /><span className="font-semibold text-slate-900">{product.name}</span></div></td>
                <td className="px-5 py-4 text-sm font-bold text-emerald-600">KES {product.price.toLocaleString()}</td>
                <td className="px-5 py-4 text-sm text-slate-700">
                    <div className="flex flex-col gap-1">
                        <span>{product.stock}</span>
                        <span className={`text-[11px] font-medium ${product.stock === 0 ? 'text-rose-600' : product.stock <= product.lowStockThreshold ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {stockState}
                        </span>
                    </div>
                </td>
                <td className="px-5 py-4 text-sm text-slate-600">{product.category.name}</td>
                <td className="px-5 py-4 text-sm"><span className={product.active ? 'text-emerald-600' : 'text-slate-500'}>{product.active ? 'Active' : 'Removed'}</span></td>
                <td className="px-5 py-4 text-sm">
                    <div className="flex items-center gap-3">
                        <Link to={`/admin/products/${product.id}/edit`} className="font-semibold text-emerald-600 hover:text-emerald-700">Edit</Link>
                        {product.active ? (
                            <button type="button" onClick={() => onRemove?.(product.id)} className="font-semibold text-rose-600 hover:text-rose-700">Remove</button>
                        ) : (
                            <button type="button" onClick={() => onRestore?.(product.id)} className="font-semibold text-sky-600 hover:text-sky-700">Restore</button>
                        )}
                    </div>
                </td>
            </tr>;
        })}</tbody>
    </table></div>;
}

export default ProductTable;
