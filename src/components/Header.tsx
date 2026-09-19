import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import SearchBar from './SearchBar';
import { useCart } from '../hooks/useCart';
import { Menu, ShoppingBasket, X } from 'lucide-react';

type HeaderProps = {
    onCartOpen: () => void;
};

const navItems = [
    { name: 'Home', to: '/' },
    { name: 'Products', to: '/products' },
    { name: 'About', to: '/about' },
];

function Header({ onCartOpen }: HeaderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { cart } = useCart();
    const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <header className="sticky top-0 z-50 border-b border-[#deded2] bg-[#f8f7f1]/95 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 lg:px-8">
                <Link to="/" className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1d3b2d] text-[#f7e6bc]">
                        <ShoppingBasket size={20} strokeWidth={1.8} />
                    </div>
                    <div>
                        <p className="font-serif text-xl font-semibold tracking-tight text-[#1d3b2d]">EverythingOnline</p>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-[#9b7440]">Your Everyday Marketplace</p>
                    </div>
                </Link>

                <div className="hidden md:block md:flex-1 md:mx-6">
                    <SearchBar onSearch={() => { }} />
                </div>

                <button
                    type="button"
                    aria-label="Toggle navigation"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#deded2] bg-white text-[#1d3b2d] transition hover:border-[#1d3b2d] md:hidden"
                    onClick={() => setIsOpen((state) => !state)}
                >
                    {isOpen ? <X size={19} /> : <Menu size={19} />}
                </button>

                <nav className="hidden items-center gap-7 text-sm font-medium text-[#69736b] md:flex">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `transition ${isActive ? 'text-[#16332b]' : 'hover:text-[#16332b]'}`
                            }
                        >
                            {item.name}
                        </NavLink>
                    ))}
                </nav>

                <button
                    type="button"
                    onClick={onCartOpen}
                    className="hidden items-center gap-3 rounded-full border border-[#deded2] bg-white px-4 py-2 text-sm font-semibold text-[#1d3b2d] transition hover:border-[#1d3b2d] md:inline-flex"
                >
                    <span>Cart</span>
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f1dfb6] text-sm font-semibold text-[#1d3b2d]">
                        {cartCount}
                    </span>
                </button>
            </div>

            {isOpen && (
                <div className="border-t border-[#e3e2da] bg-[#fcfcf9] px-6 pb-6 md:hidden">
                    <nav className="mt-4 flex flex-col gap-4 text-sm font-medium text-[#5a645d]">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) =>
                                    `block rounded-2xl px-4 py-3 transition ${isActive ? 'bg-[#f3f3ee] text-[#16332b]' : 'hover:bg-[#f7f7f4]'}`
                                }
                            >
                                {item.name}
                            </NavLink>
                        ))}
                        <button
                            type="button"
                            onClick={() => {
                                onCartOpen();
                                setIsOpen(false);
                            }}
                            className="inline-flex w-full items-center justify-center rounded-2xl bg-[#16332b] px-4 py-3 text-sm font-semibold text-[#fcfcf9] transition hover:bg-[#1e4436]"
                        >
                            View Cart
                        </button>
                    </nav>
                </div>
            )}
        </header>
    );
}

export default Header;
