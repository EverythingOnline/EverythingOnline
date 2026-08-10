import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './hooks/useCart';
import Layout from './components/Layout';
import AboutPage from './pages/AboutPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductPage from './pages/ProductPage';
import CheckoutSuccess from './pages/CheckoutSuccess';
import AdminRoutes from './admin/components/AdminRoutes';

function App() {
  return (
    <CartProvider>
      <Routes>
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/product/:slug" element={<ProductPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/checkout-success" element={<CheckoutSuccess />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </CartProvider>
  );
}

export default App;
