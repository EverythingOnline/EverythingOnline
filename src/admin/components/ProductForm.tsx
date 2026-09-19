import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    createAdminProduct,
    fetchAdminCategories,
    fetchAdminProduct,
    updateAdminProduct,
    type AdminCategory,
    type AdminProductInput,
} from '../api/admin';

type FormState = AdminProductInput;
type FieldErrors = Partial<Record<'name' | 'price' | 'stock' | 'lowStockThreshold' | 'categoryId', string>>;

const emptyState: FormState = { name: '', price: 0, stock: 0, lowStockThreshold: 5, categoryId: '', description: '', active: true };

function ProductForm() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const editing = Boolean(id);
    const [state, setState] = useState<FormState>(emptyState);
    const [categories, setCategories] = useState<AdminCategory[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [preview, setPreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(editing);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchAdminCategories()
            .then(setCategories)
            .catch((err: Error) => setError(err.message))
            .finally(() => setCategoriesLoading(false));
        if (!id) return;
        fetchAdminProduct(id)
            .then((product) => {
                setState({
                    name: product.name,
                    price: product.price,
                    stock: product.stock,
                    lowStockThreshold: product.lowStockThreshold ?? 5,
                    categoryId: product.categoryId,
                    description: product.description ?? '',
                    active: product.active,
                });
                setPreview(product.imageUrl);
            })
            .catch((err: Error) => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    function validate() {
        const nextErrors: FieldErrors = {};
        if (!state.name.trim()) nextErrors.name = 'Name is required.';
        if (!Number.isFinite(state.price) || state.price < 0) nextErrors.price = 'Enter a non-negative price.';
        if (!Number.isInteger(state.stock) || state.stock < 0) nextErrors.stock = 'Enter a non-negative whole number.';
        if (!Number.isInteger(state.lowStockThreshold) || state.lowStockThreshold < 0) nextErrors.lowStockThreshold = 'Enter a non-negative whole number.';
        if (!state.categoryId) nextErrors.categoryId = 'Category is required.';
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!validate()) return;
        setError(null);
        setSaving(true);
        try {
            if (id) await updateAdminProduct(id, state);
            else await createAdminProduct(state);
            navigate('/admin/products', { state: { success: `Product ${editing ? 'updated' : 'created'} successfully.` } });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to save product.');
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div className="rounded-2xl bg-white p-6 shadow-sm">Loading product...</div>;

    return (
        <form onSubmit={handleSubmit} className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
            <h1 className="text-2xl font-bold text-slate-900">{editing ? 'Edit Product' : 'Add Product'}</h1>
            {error && <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
            <div className="mt-6 space-y-5">
                <Field label="Name" error={errors.name}>
                    <input value={state.name} onChange={(event) => setState({ ...state, name: event.target.value })} className={inputClass(Boolean(errors.name))} />
                </Field>
                <div className="grid gap-5 sm:grid-cols-3">
                    <Field label="Price (KES)" error={errors.price}>
                        <input type="number" min="0" step="0.01" value={state.price} onChange={(event) => setState({ ...state, price: Number(event.target.value) })} className={inputClass(Boolean(errors.price))} />
                    </Field>
                    <Field label="Stock" error={errors.stock}>
                        <input type="number" min="0" step="1" value={state.stock} onChange={(event) => setState({ ...state, stock: Number(event.target.value) })} className={inputClass(Boolean(errors.stock))} />
                    </Field>
                    <Field label="Low Stock Alert" error={errors.lowStockThreshold}>
                        <input type="number" min="0" step="1" value={state.lowStockThreshold} onChange={(event) => setState({ ...state, lowStockThreshold: Number(event.target.value) })} className={inputClass(Boolean(errors.lowStockThreshold))} />
                    </Field>
                </div>
                <Field label="Category" error={errors.categoryId}>
                    <select disabled={categoriesLoading} value={state.categoryId} onChange={(event) => setState({ ...state, categoryId: event.target.value })} className={inputClass(Boolean(errors.categoryId))}>
                        <option value="">{categoriesLoading ? 'Loading categories...' : categories.length ? 'Select a category' : 'No categories available'}</option>
                        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                    </select>
                </Field>
                <Field label="Image">
                    <input type="file" accept="image/*" onChange={(event) => {
                        const image = event.target.files?.[0];
                        if (image) {
                            setState({ ...state, image });
                            setPreview(URL.createObjectURL(image));
                        }
                    }} className={inputClass(false)} />
                    {preview && <img src={preview} alt="Product preview" className="mt-3 h-24 w-24 rounded-xl object-cover" />}
                </Field>
                <Field label="Description">
                    <textarea rows={4} value={state.description} onChange={(event) => setState({ ...state, description: event.target.value })} className={inputClass(false)} />
                </Field>
                <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <input type="checkbox" checked={state.active} onChange={(event) => setState({ ...state, active: event.target.checked })} className="h-4 w-4 accent-emerald-500" />
                    Active
                </label>
            </div>
            <button type="submit" disabled={saving} className="mt-7 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:bg-emerald-600 disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Product'}
            </button>
        </form>
    );
}

function inputClass(hasError: boolean) {
    return `mt-2 w-full rounded-xl border ${hasError ? 'border-rose-500' : 'border-slate-300'} bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500`;
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return <label className="block text-sm font-medium text-slate-700"><span>{label}</span>{children}{error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}</label>;
}

export default ProductForm;
