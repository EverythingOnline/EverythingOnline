import { useEffect, useState, type FormEvent } from 'react';
import type { Product } from '../../types/product';

type ProductFormProps = {
    product?: Product;
    onSave: (product: Partial<Product>) => void;
    onCancel: () => void;
};

type FormState = {
    name: string;
    slug: string;
    brand: string;
    category: string;
    price: string;
    originalPrice: string;
    discount: string;
    rating: string;
    reviewCount: string;
    stock: string;
    description: string;
    images: string;
    nutrition: string;
};

const emptyState: FormState = {
    name: '',
    slug: '',
    brand: '',
    category: '',
    price: '',
    originalPrice: '',
    discount: '',
    rating: '',
    reviewCount: '',
    stock: '',
    description: '',
    images: '',
    nutrition: '{"calories":"","protein":"","fat":"","carbs":"","ingredients":[]}',
};

function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
    const [state, setState] = useState<FormState>(emptyState);
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

    useEffect(() => {
        if (product) {
            setState({
                ...emptyState,
                name: product.name,
                slug: product.slug,
                brand: product.brand,
                category: product.category,
                price: String(product.price),
                originalPrice: String(product.originalPrice),
                discount: String(product.discount),
                rating: String(product.rating),
                reviewCount: String(product.reviewCount),
                stock: String(product.stock),
                description: product.description,
                images: product.images.join(','),
                nutrition: JSON.stringify(product.nutrition),
            });
        }
    }, [product]);

    function validate() {
        const nextErrors: Partial<Record<keyof FormState, string>> = {};

        if (!state.name.trim()) nextErrors.name = 'Product name is required.';
        if (!state.slug.trim()) nextErrors.slug = 'Product slug is required.';
        if (!state.category.trim()) nextErrors.category = 'Category is required.';
        if (!state.brand.trim()) nextErrors.brand = 'Brand is required.';
        if (!Number.isFinite(Number(state.price)) || Number(state.price) <= 0) nextErrors.price = 'Price must be a positive number.';
        if (!Number.isFinite(Number(state.stock)) || Number(state.stock) < 0) nextErrors.stock = 'Stock must be zero or more.';
        if (!state.description.trim()) nextErrors.description = 'Description is required.';
        if (!state.images.trim()) nextErrors.images = 'At least one image URL is required.';

        try {
            JSON.parse(state.nutrition);
        } catch {
            nextErrors.nutrition = 'Nutrition must be valid JSON.';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!validate()) return;

        onSave({
            name: state.name,
            slug: state.slug,
            brand: state.brand,
            category: state.category,
            price: Number(state.price),
            originalPrice: Number(state.originalPrice),
            discount: Number(state.discount),
            rating: Number(state.rating),
            reviewCount: Number(state.reviewCount),
            stock: Number(state.stock),
            description: state.description,
            images: state.images.split(',').map((item) => item.trim()),
            nutrition: JSON.parse(state.nutrition),
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-6 md:grid-cols-2">
                {[
                    { label: 'Name', name: 'name', type: 'text' },
                    { label: 'Slug', name: 'slug', type: 'text' },
                    { label: 'Brand', name: 'brand', type: 'text' },
                    { label: 'Category', name: 'category', type: 'text' },
                    { label: 'Price (KES)', name: 'price', type: 'number' },
                    { label: 'Original Price', name: 'originalPrice', type: 'number' },
                    { label: 'Discount', name: 'discount', type: 'number' },
                    { label: 'Rating', name: 'rating', type: 'number' },
                    { label: 'Review Count', name: 'reviewCount', type: 'number' },
                    { label: 'Stock', name: 'stock', type: 'number' },
                ].map(({ label, name, type }) => (
                    <label key={name} className="block text-sm font-medium text-slate-700">
                        <span>{label}</span>
                        <input
                            type={type}
                            value={state[name as keyof FormState]}
                            onChange={(event) => setState((prev) => ({ ...prev, [name]: event.target.value }))}
                            className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
                        />
                        {errors[name as keyof FormState] && (
                            <p className="mt-2 text-xs text-rose-600">{errors[name as keyof FormState]}</p>
                        )}
                    </label>
                ))}
            </div>

            <label className="block text-sm font-medium text-slate-700">
                <span>Description</span>
                <textarea
                    value={state.description}
                    onChange={(event) => setState((prev) => ({ ...prev, description: event.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
                    rows={4}
                />
                {errors.description && <p className="mt-2 text-xs text-rose-600">{errors.description}</p>}
            </label>

            <label className="block text-sm font-medium text-slate-700">
                <span>Images (comma-separated URLs)</span>
                <input
                    type="text"
                    value={state.images}
                    onChange={(event) => setState((prev) => ({ ...prev, images: event.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
                />
                {errors.images && <p className="mt-2 text-xs text-rose-600">{errors.images}</p>}
            </label>

            <label className="block text-sm font-medium text-slate-700">
                <span>Nutrition JSON</span>
                <textarea
                    value={state.nutrition}
                    onChange={(event) => setState((prev) => ({ ...prev, nutrition: event.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
                    rows={4}
                />
                {errors.nutrition && <p className="mt-2 text-xs text-rose-600">{errors.nutrition}</p>}
            </label>

            <div className="flex flex-wrap gap-3 pt-2">
                <button type="submit" className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
                    Save product
                </button>
                <button type="button" onClick={onCancel} className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm text-slate-700 transition hover:bg-slate-50">
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default ProductForm;
