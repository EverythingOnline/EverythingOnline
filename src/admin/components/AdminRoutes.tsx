import { Routes, Route } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import AdminGuard from './AdminGuard';
import Dashboard from '../pages/Dashboard';
import Products from '../pages/Products';
import Orders from '../pages/Orders';
import Payments from '../pages/Payments';
import AdminLogin from '../pages/Login';

function AdminRoutes() {
    return (
        <Routes>
            <Route path="login" element={<AdminLogin />} />
            <Route
                element={
                    <AdminGuard>
                        <AdminLayout />
                    </AdminGuard>
                }
            >
                <Route index element={<Dashboard />} />
                <Route path="products" element={<Products />} />
                <Route path="orders" element={<Orders />} />
                <Route path="payments" element={<Payments />} />
            </Route>
        </Routes>
    );
}

export default AdminRoutes;
