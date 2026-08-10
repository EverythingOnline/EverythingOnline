import Header from './Header';
import Footer from './Footer';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CartDrawer from './CartDrawer';
import { useCart } from '../hooks/useCart';

type LayoutProps = {
  children: React.ReactNode;
};

function Layout({ children }: LayoutProps) {
  const { cart, removeItem, setQuantity } = useCart();
  const [isCartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fcfcf9] text-[#26302b]">
      <Header onCartOpen={() => setCartOpen(true)} />
      <main className="flex-1">{children}</main>
      <Footer />
      {isCartOpen && (
        <CartDrawer
          items={cart.items}
          subtotal={cart.subtotal}
          total={cart.total}
          onClose={() => setCartOpen(false)}
          onRemoveItem={removeItem}
          onSetQuantity={setQuantity}
          onCheckout={() => {
            setCartOpen(false);
            navigate('/checkout');
          }}
        />
      )}
    </div>
  );
}

export default Layout;
