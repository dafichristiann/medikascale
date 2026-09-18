interface Props {
  label: string;
  value: string | number;
  hint?: string;
  accent?: 'teal' | 'green' | 'amber' | 'red' | 'grey';
}

const accentClass: Record<NonNullable<Props['accent']>, string> = {
  teal: 'border-l-teal',
  green: 'border-l-status-green',
  amber: 'border-l-status-amber',
  red: 'border-l-status-red',
  grey: 'border-l-status-grey',
};

export default function StatCard({ label, value, hint, accent = 'teal' }: Props) {
  return (
    <div className={`bg-white border border-border rounded-xl p-4 shadow-card border-l-4 ${accentClass[accent]}`}>
      <div className="text-[12.5px] text-slate mb-1.5">{label}</div>
      <div className="text-2xl font-extrabold text-ink">{value}</div>
      {hint && <div className="text-[11.5px] text-slate mt-1">{hint}</div>}
    </div>
  );
}
