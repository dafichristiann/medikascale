import { useEffect, useState, useRef } from 'react';
import { Menu, Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { fetchNotifikasi, markNotifikasiRead, markAllNotifikasiRead } from '@/api/notifikasi';
import type { NotifikasiItem } from '@/types';

export default function Topbar({ title, onToggleSidebar }: { title: string; onToggleSidebar: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const [notifikasi, setNotifikasi] = useState<NotifikasiItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotif = async () => {
    try {
      const res = await fetchNotifikasi();
      setNotifikasi(res.data || []);
      setUnreadCount(res.unread_count || 0);
    } catch {
      // Ignore background poll errors
    }
  };

  useEffect(() => {
    loadNotif();
    const pollId = setInterval(loadNotif, 15_000);
    const clockId = setInterval(() => setNow(new Date()), 30_000);
    return () => {
      clearInterval(pollId);
      clearInterval(clockId);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkOne = async (item: NotifikasiItem) => {
    if (!item.dibaca) {
      await markNotifikasiRead(item.id);
      setNotifikasi((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, dibaca: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    if (item.tautan) {
      setIsOpen(false);
      navigate(item.tautan);
    }
  };

  const handleMarkAll = async () => {
    await markAllNotifikasiRead();
    setNotifikasi((prev) => prev.map((n) => ({ ...n, dibaca: true })));
    setUnreadCount(0);
  };

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

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative p-2 text-slate hover:text-ink hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Pusat Notifikasi"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-xl border border-border py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-ink">Notifikasi</span>
                  {unreadCount > 0 && (
                    <span className="bg-teal-tint text-teal-dark font-medium text-xs px-2 py-0.5 rounded-full">
                      {unreadCount} baru
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAll}
                    className="text-xs text-teal-dark hover:underline flex items-center gap-1"
                  >
                    <CheckCheck size={14} /> Tandai semua dibaca
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-border">
                {notifikasi.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate">
                    Tidak ada notifikasi saat ini
                  </div>
                ) : (
                  notifikasi.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleMarkOne(item)}
                      className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex gap-3 ${
                        !item.dibaca ? 'bg-teal-tint/20' : ''
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span
                            className={`text-xs font-semibold ${
                              !item.dibaca ? 'text-teal-dark' : 'text-slate-700'
                            }`}
                          >
                            {item.judul}
                          </span>
                          <span className="text-[10px] text-slate font-mono">
                            {new Date(item.created_at).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {item.pesan}
                        </p>
                      </div>
                      {item.tautan && (
                        <ExternalLink size={14} className="text-slate-400 self-center shrink-0" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="text-[13px] text-slate flex items-center gap-3 border-l border-border pl-4">
          <span className="font-mono hidden sm:inline">
            {now.toLocaleString('id-ID', {
              weekday: 'short',
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          <span className="hidden sm:inline">·</span>
          <span className="font-medium text-ink">{user?.nama ?? '—'}</span>
        </div>
      </div>
    </header>
  );
}
