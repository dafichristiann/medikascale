import type { ReactNode } from 'react';
import Chip from '@/components/Chip';

export function PageTitle({ title, description, action }: { title: string; description: string; action?: ReactNode }) { return <div className="mb-5 flex flex-wrap justify-between gap-3"><div><h2 className="text-xl font-bold mb-1">{title}</h2><p className="text-slate text-[13.5px] max-w-2xl">{description}</p></div>{action}</div>; }
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) { return <section className={`bg-white border border-border rounded-xl ${className}`}>{children}</section>; }
export function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block text-[12px] font-semibold text-slate">{label}<span className="block mt-1.5">{children}</span></label>; }
export const inputClass = 'w-full border border-border rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:border-teal';
export function StatusBadge({ status }: { status: string }) { const tone = ['selesai', 'tersedia', 'direview', 'hasil_siap', 'siap'].includes(status) ? 'green' : ['diproses', 'dipinjam', 'dikirim'].includes(status) ? 'amber' : status === 'dibatalkan' || status === 'dikembalikan' ? 'red' : 'grey'; return <Chip tone={tone as 'green' | 'amber' | 'red' | 'grey'}>{status.replace(/_/g, ' ')}</Chip>; }
export function Alert({ children }: { children: ReactNode }) { return <div className="mt-3 rounded-lg bg-status-greenTint text-status-green text-[13px] px-3 py-2">{children}</div>; }
