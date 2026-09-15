import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

type StatCardProps = {
    label: string;
    value: string | number;
    valueClassName?: string;
    trend?: string;
    positive?: boolean;
    subtext?: string;
    icon?: 'up' | 'down';
};

function StatCard({
    label,
    value,
    valueClassName = 'text-slate-900',
    trend,
    positive = true,
    subtext,
    icon,
}: StatCardProps) {
    const TrendIcon = positive ? ArrowUpRight : ArrowDownRight;

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
            <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
            </div>
            <p className={`mt-4 text-3xl font-bold ${valueClassName}`}>{value}</p>
            {(trend || subtext) && (
                <div className="mt-4 flex items-center gap-2 text-sm">
                    <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-medium ${positive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}
                    >
                        <TrendIcon className="h-3.5 w-3.5" />
                        {trend ?? subtext}
                    </span>
                    {subtext && trend ? <span className="text-slate-500">{subtext}</span> : null}
                </div>
            )}
            {icon && !trend && !subtext ? <div className="mt-4 text-slate-400">{icon}</div> : null}
        </div>
    );
}

export default StatCard;
