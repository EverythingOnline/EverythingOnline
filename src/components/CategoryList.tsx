type CategoryListProps = {
    categories: string[];
    selected: string;
    onSelect: (category: string) => void;
};

function CategoryList({ categories, selected, onSelect }: CategoryListProps) {
    return (
        <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
                <button
                    key={category}
                    type="button"
                    onClick={() => onSelect(category)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${selected === category
                            ? 'border-[#16332b] bg-[#16332b] text-white'
                            : 'border-[#e3e2da] bg-white text-[#5a645d] hover:border-[#16332b] hover:text-[#16332b]'
                        }`}
                >
                    {category}
                </button>
            ))}
        </div>
    );
}

export default CategoryList;
