import { NavLink, useNavigate } from 'react-router-dom';
import { Repeat2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { NAV_ITEMS } from './navConfig';

export default function Sidebar({ open }: { open: boolean }) {
  const { user, hasPermission, logout } = useAuth();
  const navigate = useNavigate();

  const visibleItems = NAV_ITEMS.filter((item) => !item.permission || hasPermission(item.permission));

  function handleChangeRole() {
    logout();
    navigate('/demo-role');
  }

  return (
    <aside
      className={`fixed md:sticky top-0 h-screen w-[230px] shrink-0 bg-gradient-to-b from-navy-deep to-navy-mid text-white p-4 flex flex-col z-40 transition-transform
        ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
    >
      <div className="flex items-center gap-2 px-2 mb-6 font-extrabold text-lg">
        <span className="w-2.5 h-2.5 rounded bg-teal inline-block" />
        MedikaScale
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        <div className="text-[11px] uppercase tracking-wider text-slate-300/70 px-2 pt-2 pb-1">Menu</div>
        {visibleItems.map((item, index) => {
          const showGroup = item.group && visibleItems[index - 1]?.group !== item.group;

          return (
            <div key={`${item.path}-${item.label}`}>
              {showGroup && (
                <div className="text-[11px] uppercase tracking-wider text-slate-300/70 px-2 pt-4 pb-1">{item.group}</div>
              )}
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium border-l-2 transition-colors
                  ${isActive ? 'bg-teal/20 text-white border-teal' : 'text-slate-200/80 border-transparent hover:bg-white/5'}`
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/10 pt-3 mt-3">
        <div className="px-2 pb-2 text-xs text-slate-300/70">
          <div className="font-semibold text-slate-100">{user?.nama}</div>
          <div>{user?.role.nama_tampil}</div>
        </div>
        <button
          onClick={handleChangeRole}
          className="flex items-center gap-2 text-sm text-slate-200/80 hover:text-white px-2 py-1.5"
        >
          <Repeat2 size={16} /> Ganti role
        </button>
      </div>
    </aside>
  );
}
