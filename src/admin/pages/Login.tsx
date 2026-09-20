import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as any)?.from?.pathname || '/admin';

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        try {
            const response = await fetch(`${API_URL}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const body = await response.json();
            if (!response.ok) {
                throw new Error(body?.error ?? 'Unable to sign in');
            }

            localStorage.setItem('admin-auth-token', body.token);
            navigate(from, { replace: true });
        } catch (err: any) {
            setError(err?.message ?? 'Unable to sign in.');
        }
    }

    return (
        <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-900">Admin sign in</h1>
            <p className="mt-2 text-sm text-slate-500">Enter your admin email and password to continue.</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                    <span>Email</span>
                    <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
                        placeholder="admin@example.com"
                        required
                    />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                    <span>Password</span>
                    <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
                        required
                    />
                </label>
                {error && <p className="text-sm text-rose-600">{error}</p>}
                <button type="submit" className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
                    Sign in
                </button>
            </form>
        </div>
    );
}

export default AdminLogin;
