function AboutPage() {
    return (
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8 lg:py-20">
            <header className="max-w-3xl border-b border-[#e3e2da] pb-12">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#9b7440]">Your Everyday Marketplace.</p>
                <h1 className="mt-4 font-serif text-4xl leading-tight text-[#16332b] md:text-5xl">EverythingOnline, built around everyday life.</h1>
            </header>

            <div className="mt-12 max-w-4xl space-y-14">
                <section>
                    <h2 className="font-serif text-3xl text-[#16332b]">Who we are</h2>
                    <div className="mt-5 space-y-5 text-base leading-8 text-[#5a645d]">
                        <p>EverythingOnline is Kenya's online marketplace for everyday essentials. We started with a simple observation: finding good, trustworthy products online in Kenya often means jumping between platforms, second-guessing quality, and dealing with checkout experiences that feel like an afterthought. We built EverythingOnline to fix that - one platform, verified suppliers, and a shopping experience designed with care from the first click to the final order.</p>
                        <p>We're starting with fresh groceries and dairy, sourced from certified suppliers, because food is where trust matters most. From there, we're building out toward a full marketplace - covering household essentials, personal care, electronics, and more - so that over time, EverythingOnline becomes the one place you turn to for everything you need, not just groceries.</p>
                    </div>
                </section>

                <section>
                    <h2 className="font-serif text-3xl text-[#16332b]">What we do</h2>
                    <div className="mt-5 space-y-5 text-base leading-8 text-[#5a645d]">
                        <p>At our core, EverythingOnline connects shoppers with trusted local suppliers. We vet who we work with, verify product quality before it reaches our catalog, and give you a straightforward way to browse, compare, and order - all in one place.</p>
                        <p>Behind the scenes, every order you place moves through a clear, trackable process: from the moment you check out, through confirmation, to fulfillment. We're building the tools to make that process transparent to you as a customer, so you're never left wondering what's happening with your order.</p>
                    </div>
                </section>

                <section>
                    <h2 className="font-serif text-3xl text-[#16332b]">Why EverythingOnline</h2>
                    <div className="mt-6 grid gap-8 md:grid-cols-2">
                        <Value title="Certified quality.">Every grocery and dairy product on our platform comes from certified sources. We don't just list products - we stand behind them. As we expand into new categories, that same standard of verification follows.</Value>
                        <Value title="A growing marketplace.">We're not trying to be everything on day one. We're growing deliberately - starting with groceries and dairy, and adding new categories as we build out the supplier relationships and quality checks that back them. What you see today is the foundation, not the ceiling.</Value>
                        <Value title="Simple, secure checkout.">Ordering shouldn't require a manual. Our checkout is built to be quick and clear, with secure M-Pesa payments and order tracking so you always know where things stand.</Value>
                        <Value title="Built for how Kenyans shop.">Prices in KES, a platform designed around local needs and habits, and a team that's building this from within the market we're serving - not adapting something built for somewhere else.</Value>
                        <Value title="A platform that listens.">We're early in our journey, and that means your feedback shapes what we build next - which products we add, which categories we prioritize, and how we improve the experience along the way.</Value>
                    </div>
                </section>

                <section>
                    <h2 className="font-serif text-3xl text-[#16332b]">Our promise</h2>
                    <p className="mt-5 text-base leading-8 text-[#5a645d]">We're a young platform, and we're growing every day - but a few things won't change as we do: fair prices, real quality behind every product we list, and a shopping experience that respects your time and your trust. We'd rather grow slowly and get it right than rush and let quality slip.</p>
                </section>

                <section className="border-t border-[#e3e2da] pt-12">
                    <h2 className="font-serif text-3xl text-[#16332b]">Get in touch</h2>
                    <p className="mt-5 text-base leading-8 text-[#5a645d]">Have a question, some feedback, or a product you'd love to see on EverythingOnline? We want to hear from you. We're building this platform with our customers at the center - not just for them, but alongside them - and every message helps shape what comes next.</p>
                </section>
            </div>
        </div>
    );
}

function Value({ title, children }: { title: string; children: string }) {
    return (
        <div className="border-l-2 border-[#c9a15a] pl-5">
            <h3 className="text-base font-semibold text-[#16332b]">{title}</h3>
            <p className="mt-2 text-sm leading-7 text-[#5a645d]">{children}</p>
        </div>
    );
}

export default AboutPage;
