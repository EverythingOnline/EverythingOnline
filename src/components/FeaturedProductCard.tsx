type FeaturedProductCardProps = {
  name: string;
  description: string;
  price: string;
};

function FeaturedProductCard({ name, description, price }: FeaturedProductCardProps) {
  return (
    <article className="group rounded-[2rem] border border-[#e3e2da] bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c9a15a]">Featured</p>
          <h3 className="mt-4 text-2xl font-semibold text-[#16332b]">{name}</h3>
        </div>
        <span className="rounded-full bg-[#f7f7f4] px-4 py-2 text-sm font-semibold text-[#16332b]">{price}</span>
      </div>
      <p className="mt-6 text-sm leading-6 text-[#5a645d]">{description}</p>
      <div className="mt-8 flex items-center justify-between">
        <span className="text-sm text-[#6e8fa3]">Best choice</span>
        <button className="rounded-2xl bg-[#16332b] px-4 py-2 text-sm font-semibold text-[#fcfcf9] transition hover:bg-[#1e4436]">
          Add to cart
        </button>
      </div>
    </article>
  );
}

export default FeaturedProductCard;
