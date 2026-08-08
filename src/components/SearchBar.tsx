import { useState, FormEvent } from 'react';

type SearchBarProps = {
    onSearch: (query: string) => void;
};

function SearchBar({ onSearch }: SearchBarProps) {
    const [query, setQuery] = useState('');

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        onSearch(query.trim());
    }

    return (
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3 sm:flex-row">
            <label htmlFor="search" className="sr-only">
                Search products
            </label>
            <input
                id="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search milk, categories, brands..."
                className="w-full rounded-3xl border border-[#e3e2da] bg-white px-5 py-4 text-sm text-[#26302b] outline-none transition focus:border-[#16332b] focus:ring-2 focus:ring-[#c9a15a]/20"
            />
            <button
                type="submit"
                className="inline-flex h-14 items-center justify-center rounded-3xl bg-[#16332b] px-6 text-sm font-semibold text-white transition hover:bg-[#1e4436]"
            >
                Search
            </button>
        </form>
    );
}

export default SearchBar;
