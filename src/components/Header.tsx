import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import SearchBar from './SearchBar';
import { useCart } from '../hooks/useCart';

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
        <header className="sticky top-0 z-50 border-b border-[#e3e2da] bg-[#fcfcf9]/95 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
                <Link to="/" className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#c9a15a]/10 text-[#16332b]">
                        <span className="text-lg font-semibold">A</span>
                    </div>
                    <div>
                        <p className="font-serif text-2xl font-semibold tracking-tight text-[#16332b]">EverythingOnline</p>
                        <p className="text-xs uppercase tracking-[0.35em] text-[#6e8fa3]">Everyday essentials</p>
                    </div>
                </Link>

                <div className="hidden md:block md:flex-1 md:mx-6">
                    <SearchBar onSearch={() => { }} />
                </div>

                <button
                    type="button"
                    aria-label="Toggle navigation"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#e3e2da] bg-white text-[#16332b] transition hover:border-[#c9a15a] md:hidden"
                    onClick={() => setIsOpen((state) => !state)}
                >
                    <span className="text-lg font-semibold">{isOpen ? '×' : '☰'}</span>
                </button>

                <nav className="hidden items-center gap-6 text-sm font-medium text-[#5a645d] md:flex">
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
                    className="hidden items-center gap-3 rounded-3xl border border-[#e3e2da] bg-white px-4 py-2 text-sm font-semibold text-[#16332b] transition hover:border-[#16332b] md:inline-flex"
                >
                    <span>Cart</span>
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f7f7f4] text-sm font-semibold text-[#16332b]">
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
