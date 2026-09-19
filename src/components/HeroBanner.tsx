import { Link } from 'react-router-dom';

function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-[#e7eee2] py-16 sm:py-24">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[3rem] border-[#d4e1d0] opacity-70" />
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-5 inline-block text-xs font-bold uppercase tracking-[0.3em] text-[#9b7440]">
              Fresh from our farms
            </p>
            <h1 className="max-w-2xl font-serif text-5xl font-semibold leading-[1.04] text-[#1d3b2d] sm:text-7xl">
              Better basics for every kind of day.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#58665d] sm:text-lg">
              EverythingOnline is your go-to platform for farm-fresh dairy, pantry essentials, and sustainably sourced groceries.
              Browse curated products designed for home cooks, coffee lovers, and busy families across Kenya.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/products"
                className="inline-flex items-center justify-center rounded-full bg-[#1d3b2d] px-7 py-3.5 text-sm font-semibold text-[#fcfcf9] transition hover:bg-[#315743]"
              >
                Shop now
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center rounded-full border border-[#1d3b2d] bg-transparent px-7 py-3.5 text-sm font-semibold text-[#1d3b2d] transition hover:bg-white"
              >
                Learn more
              </Link>
            </div>
          </div>

          <div className="relative rounded-[2.5rem] bg-[#f8f7f1] p-7 shadow-[0_30px_70px_-45px_rgb(29,59,45,0.45)] sm:p-10">
            <div className="grid gap-6">
              <div className="rounded-3xl border border-[#f0ede7] bg-[#fcfcf9] p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6e8fa3]">Daily bundle</p>
                <h2 className="mt-4 text-2xl font-semibold text-[#16332b]">Morning milk crate</h2>
                <p className="mt-3 text-sm leading-6 text-[#5a645d]">
                  Fresh milk, creamy yogurt, and artisanal butter delivered in one complete set.
                </p>
                <div className="mt-6 flex items-center justify-between text-sm font-semibold text-[#16332b]">
                  <span>KSh 1,850</span>
                  <span className="rounded-full bg-[#c9a15a]/10 px-3 py-1 text-[#8d6f35]">Best seller</span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-[#f0ede7] bg-[#fcfcf9] p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6e8fa3]">Farm freshness</p>
                  <p className="mt-3 text-sm leading-6 text-[#5a645d]">Local sourcing from trusted dairy partners.</p>
                </div>
                <div className="rounded-3xl border border-[#f0ede7] bg-[#fcfcf9] p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6e8fa3]">Satisfaction guarantee</p>
                  <p className="mt-3 text-sm leading-6 text-[#5a645d]">Delivered fresh or your money back within 24 hours.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroBanner;
