import { Pencil, Star, Trash2 } from 'lucide-react';
import type { Product } from '../../types/product';

type ProductTableProps = {
    products: Product[];
    isLoading: boolean;
    onEdit: (product: Product) => void;
    onDelete: (id: string) => void;
};

function ProductTable({ products, isLoading, onEdit, onDelete }: ProductTableProps) {
    if (isLoading) {
        return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">Loading products...</div>;
    }

    if (products.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600 shadow-sm">
                <p className="text-lg font-semibold text-slate-900">No products yet</p>
                <p className="mt-2 text-sm">Add your first product to appear in the catalog.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
            <table className="min-w-full text-left">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Product</th>
                        <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Brand</th>
                        <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Price</th>
                        <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Stock</th>
                        <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Rating</th>
                        <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {products.map((product) => (
                        <tr key={product.id} className="transition hover:bg-slate-50/80">
                            <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={product.images?.[0] ?? 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=200&q=80'}
                                        alt={product.name}
                                        className="h-12 w-12 rounded-xl object-cover"
                                    />
                                    <div>
                                        <p className="font-semibold text-slate-900">{product.name}</p>
                                        <p className="text-xs text-slate-500">{product.category}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-600">{product.brand}</td>
                            <td className="px-5 py-4 text-sm font-bold text-emerald-600">KES {product.price.toLocaleString()}</td>
                            <td className="px-5 py-4 text-sm text-slate-700">{product.stock}</td>
                            <td className="px-5 py-4 text-sm text-slate-700">
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-amber-700">
                                    <Star className="h-3.5 w-3.5 fill-current" />
                                    {Number(product.rating ?? 0).toFixed(1)}
                                </span>
                            </td>
                            <td className="px-5 py-4">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => onEdit(product)}
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                                        aria-label={`Edit ${product.name}`}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDelete(product.id)}
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                                        aria-label={`Delete ${product.name}`}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ProductTable;
