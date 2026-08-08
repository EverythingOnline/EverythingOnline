function QuickStats() {
    const stats = [
        { label: 'Fresh products', value: '120+' },
        { label: 'Trusted sellers', value: '8' },
        { label: 'Happy customers', value: '20k' },
    ];

    return (
        <div className="rounded-[2rem] border border-[#e3e2da] bg-white p-6 shadow-sm">
            <div className="grid gap-5 sm:grid-cols-3">
                {stats.map((stat) => (
                    <div key={stat.label} className="space-y-2">
                        <p className="text-3xl font-semibold text-[#16332b]">{stat.value}</p>
                        <p className="text-sm uppercase tracking-[0.22em] text-[#6e8fa3]">{stat.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default QuickStats;
