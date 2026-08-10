import { Navigate, useLocation } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

const AUTH_KEY = 'admin-auth-token';

export function isAdminAuthenticated() {
    return Boolean(localStorage.getItem(AUTH_KEY));
}

function AdminGuard({ children }: PropsWithChildren) {
    const location = useLocation();

    if (!isAdminAuthenticated()) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}

export default AdminGuard;
