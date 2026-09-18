import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Topbar({ title, onToggleSidebar }: { title: string; onToggleSidebar: () => void }) {
  const { user } = useAuth();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button className="md:hidden text-ink" onClick={onToggleSidebar} aria-label="Buka menu">
          <Menu size={20} />
        </button>
        <h1 className="text-[16.5px] font-bold">{title}</h1>
        {user && (
          <span className="text-[11.5px] font-semibold text-teal-dark bg-teal-tint px-2.5 py-0.5 rounded-full">
            {user.role.nama_tampil}
          </span>
        )}
      </div>
      <div className="text-[13px] text-slate flex items-center gap-3">
        <span className="font-mono">
          {now.toLocaleString('id-ID', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </span>
        <span>·</span>
        <span>{user?.nama ?? '—'}</span>
      </div>
    </header>
  );
}
