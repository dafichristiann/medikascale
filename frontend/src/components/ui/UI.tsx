import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes } from 'react';
import { AlertCircle, CheckCircle2, Info, Loader2, TriangleAlert } from 'lucide-react';

export type Tone = 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <section className={`rounded-2xl border border-[#e5eaf1] bg-white p-6 shadow-[0_8px_24px_rgba(28,45,72,.05)] ${className}`}>{children}</section>
);

export const PageHeader = ({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div><h1 className="text-3xl font-extrabold tracking-tight text-[#172033]">{title}</h1>{description && <p className="mt-1 text-sm text-[#718096]">{description}</p>}</div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </div>
);

export const StatCard = ({ label, value, icon, tone = 'primary', description }: { label: string; value: string | number; icon: ReactNode; tone?: Tone; description?: string }) => (
  <Card className={`stat-card tone-${tone}`}><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-wide text-[#718096]">{label}</p><p className="mt-3 text-3xl font-extrabold text-[#172033]">{value}</p>{description && <p className="mt-1 text-xs text-[#91a0b5]">{description}</p>}</div><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8f1ff] text-[#2778e6]">{icon}</span></div></Card>
);

const toneMap: Record<string, string> = { putih: 'neutral', hijau: 'success', kuning: 'warning', merah: 'danger', normal: 'success', 'at-risk': 'warning', 'gizi buruk': 'danger' };
export const StatusBadge = ({ status, label, tone }: { status: string; label?: string; tone?: Tone }) => {
  const resolved = tone || toneMap[status.toLowerCase()] || 'neutral';
  return <span className={`status-badge status-${resolved}`}><span className="status-dot" />{label || status}</span>;
};

export const LoadingState = ({ label = 'Memuat data...' }: { label?: string }) => <div className="flex min-h-32 items-center justify-center gap-2 text-sm text-[#718096]"><Loader2 className="animate-spin" size={18} />{label}</div>;
export const EmptyState = ({ title, description, action, icon }: { title: string; description: string; action?: ReactNode; icon?: ReactNode }) => <div className="flex min-h-48 flex-col items-center justify-center px-6 text-center"><span className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-[#eef3f8] text-[#718096]">{icon || <Info size={22} />}</span><h3 className="font-bold text-[#172033]">{title}</h3><p className="mt-1 max-w-sm text-sm text-[#718096]">{description}</p>{action && <div className="mt-4">{action}</div>}</div>;
export const ErrorState = ({ onRetry }: { onRetry?: () => void }) => <div className="flex min-h-32 flex-col items-center justify-center text-center"><AlertCircle className="text-[#c93750]" size={24} /><p className="mt-2 text-sm text-[#b4233e]">Data gagal dimuat.</p>{onRetry && <button onClick={onRetry} className="btn-secondary mt-3 text-xs">Coba lagi</button>}</div>;

export const Button = ({ children, loading, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) => <button {...props} disabled={loading || props.disabled} className={`${props.className || 'btn-primary'} inline-flex items-center justify-center gap-2`}>{loading && <Loader2 size={16} className="animate-spin" />}{children}</button>;
export const Field = ({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) => <div><label className="mb-1.5 block text-sm font-semibold text-[#405066]">{label}</label>{children}{hint && !error && <p className="mt-1 text-xs text-[#91a0b5]">{hint}</p>}{error && <p className="mt-1 text-xs font-medium text-[#b4233e]">{error}</p>}</div>;
export const TextInput = (props: InputHTMLAttributes<HTMLInputElement>) => <input {...props} className={`w-full ${props.className || ''}`} />;
export const SelectInput = (props: SelectHTMLAttributes<HTMLSelectElement>) => <select {...props} className={`w-full ${props.className || ''}`} />;

export const FeedbackIcon = ({ tone }: { tone: Tone }) => tone === 'success' ? <CheckCircle2 size={18} /> : tone === 'warning' ? <TriangleAlert size={18} /> : <Info size={18} />;
