type StatCardProps = {
    label: string;
    value: string | number;
    accent?: string;
};

function StatCard({ label, value, accent = 'bg-slate-100' }: StatCardProps) {
    return (
        <div className={`rounded-3xl border border-slate-200 p-6 ${accent}`}>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{value}</p>
        </div>
    );
}

export default StatCard;
