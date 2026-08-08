import { Link } from 'react-router-dom';

function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-[#f3f3ee] py-20 sm:py-24">
      <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,_rgba(201,161,90,0.15),_transparent_55%)]" />
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="mb-4 inline-block rounded-full border border-[#c9a15a]/30 bg-[#fff6db] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#8d6f35]">
              Fresh dairy delivered daily
            </p>
            <h1 className="font-serif text-5xl font-semibold leading-tight text-[#16332b] sm:text-6xl">
              Pure milk, wholesome staples, and effortless delivery for modern homes.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#5a645d]">
              EverythingOnline is your go-to platform for farm-fresh dairy, pantry essentials, and sustainably sourced groceries.
              Browse curated products designed for home cooks, coffee lovers, and busy families across Kenya.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/products"
                className="inline-flex items-center justify-center rounded-2xl bg-[#16332b] px-6 py-3 text-sm font-semibold text-[#fcfcf9] transition hover:bg-[#1e4436]"
              >
                Shop now
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center rounded-2xl border border-[#16332b] bg-white px-6 py-3 text-sm font-semibold text-[#16332b] transition hover:bg-[#f7f7f4]"
              >
                Learn more
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#e3e2da] bg-white p-8 shadow-[0_40px_80px_-50px_rgb(22,51,43,0.2)] sm:p-10">
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
