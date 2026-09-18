import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

const TITLE_BY_PATH: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/antrian': 'Antrian pasien',
  '/antropometri': 'Antropometri',
  '/arsip': 'Arsip rekam medis',
  '/resep': 'Pesan resep',
  '/lab': 'Lab & Radiologi',
  '/layanan': 'Layanan',
};

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = TITLE_BY_PATH[location.pathname] ?? 'MedikaScale';

  return (
    <div className="min-h-screen flex bg-bg">
      <Sidebar open={sidebarOpen} />
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar title={title} onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <main className="flex-1 p-6 md:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
