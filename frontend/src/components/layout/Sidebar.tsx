import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Activity, ClipboardList, FileText, FlaskConical, Home, Pill } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: '📊', href: '/dashboard', permissions: [] },
  { label: 'Antrian', icon: '📋', href: '/antrian', permissions: ['antrian.view'] },
  { label: 'Antropometri', icon: '📏', href: '/antropometri', permissions: ['antropometri.view'] },
  { label: 'Rekam Medis', icon: '📄', href: '/rekam-medis', permissions: ['rekam_medis.view'] },
  { label: 'Lab & Radiologi', icon: '🔬', href: '/lab-radiologi', permissions: ['lab.view'] },
  { label: 'Resep', icon: '💊', href: '/resep', permissions: ['resep.view'] },
];
const NAV_ICONS = [Home, ClipboardList, Activity, FileText, FlaskConical, Pill];

export const Sidebar = () => {
  const location = useLocation();
  const { hasPermission } = useAuthStore();

  const canView = (permissions: string[]) => {
    return permissions.length === 0 || permissions.some((p) => hasPermission(p));
  };

  return (
    <aside className="app-sidebar w-64 shrink-0 border-r border-[#e7ebf1] bg-white">
      <nav className="flex flex-col gap-2 p-4 pt-7">
        {NAV_ITEMS.filter((item) => canView(item.permissions)).map((item) => {
          const Icon = NAV_ICONS[NAV_ITEMS.indexOf(item)];
          return (
          <Link
            key={item.href}
            to={item.href}
            className={`flex items-center gap-2 rounded px-4 py-2 text-sm font-medium transition ${
              location.pathname === item.href
                ? 'bg-[#e8f1ff] text-[#1767d4] shadow-sm'
                : 'text-[#65748a] hover:bg-[#f5f7fa] hover:text-[#172033]'
            }`}
          >
            <span aria-hidden="true"><Icon size={18} strokeWidth={2.2} /></span>
            <span>{item.label}</span>
          </Link>
          );
        })}
      </nav>
    </aside>
  );
};
