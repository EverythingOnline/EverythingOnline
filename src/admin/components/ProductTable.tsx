import type { Product } from '../../types/product';

type ProductTableProps = {
    products: Product[];
    isLoading: boolean;
    onEdit: (product: Product) => void;
    onDelete: (id: string) => void;
};

function ProductTable({ products, isLoading, onEdit, onDelete }: ProductTableProps) {
    if (isLoading) {
        return <p className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600">Loading products...</p>;
    }

    if (products.length === 0) {
        return (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
                <p className="text-lg font-semibold">No products yet</p>
                <p className="mt-2 text-sm">Add your first product to appear in the catalog.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-left">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Name</th>
                        <th className="px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Category</th>
                        <th className="px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Price</th>
                        <th className="px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Stock</th>
                        <th className="px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {products.map((product) => (
                        <tr key={product.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 text-sm text-slate-800">{product.name}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{product.category}</td>
                            <td className="px-6 py-4 text-sm text-slate-800">KES {product.price.toFixed(0)}</td>
                            <td className="px-6 py-4 text-sm text-slate-800">{product.stock}</td>
                            <td className="px-6 py-4 text-sm text-slate-600 space-x-2">
                                <button
                                    type="button"
                                    onClick={() => onEdit(product)}
                                    className="rounded-full border border-slate-300 bg-white px-3 py-1 text-slate-700 transition hover:bg-slate-100"
                                >
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDelete(product.id)}
                                    className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-rose-700 transition hover:bg-rose-100"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ProductTable;
