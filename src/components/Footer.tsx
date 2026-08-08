import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer className="border-t border-[#e3e2da] bg-[#16332b] py-10 text-[#b9c8c0]">
            <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[1.4fr_0.8fr_0.8fr] lg:px-8">
                <div className="space-y-4">
                    <p className="font-serif text-2xl font-semibold text-[#fcfcf9]">EverythingOnline</p>
                    <p className="max-w-sm text-sm leading-6 text-[#c5d1c8]">
                        Fresh groceries and household essentials delivered with care across Kenya. We make everyday shopping simple, reliable, and beautiful.
                    </p>
                </div>

                <div>
                    <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#c9a15a]">Explore</p>
                    <ul className="space-y-3 text-sm text-[#c5d1c8]">
                        <li><Link to="/" className="transition hover:text-white">Home</Link></li>
                        <li><Link to="/products" className="transition hover:text-white">Products</Link></li>
                        <li><Link to="/about" className="transition hover:text-white">About</Link></li>
                    </ul>
                </div>

                <div>
                    <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#c9a15a]">Support</p>
                    <ul className="space-y-3 text-sm text-[#c5d1c8]">
                        <li><a href="#" className="transition hover:text-white">Contact</a></li>
                        <li><a href="#" className="transition hover:text-white">Help center</a></li>
                    </ul>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
