import { useNavigate } from 'react-router-dom';
import { Stethoscope, HeartPulse, Pill, FlaskConical, Archive, ShieldCheck } from 'lucide-react';
import { MOCK_USERS } from '@/data/mockData';
import { useAuth } from '@/context/AuthContext';

const ICON_BY_ROLE = {
  admin: ShieldCheck,
  dokter: Stethoscope,
  perawat: HeartPulse,
  apoteker: Pill,
  lab_radiologi: FlaskConical,
  arsiparis: Archive,
};

export default function DemoRoleSelector() {
  const { selectDemoUser } = useAuth();
  const navigate = useNavigate();

  async function selectRole(user: (typeof MOCK_USERS)[number]) {
    await selectDemoUser(user);
    navigate('/dashboard');
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-navy-deep to-navy-mid">
      <section className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-7 sm:p-9">
        <div className="text-center mb-7">
          <div className="inline-flex items-center gap-2 font-extrabold text-lg mb-2">
            <span className="w-2.5 h-2.5 rounded bg-teal inline-block" />
            MedikaScale
          </div>
          <h1 className="text-2xl font-bold">Pilih role demo</h1>
          <p className="text-slate text-sm mt-2">Masuk tanpa password untuk melihat menu dan hak akses setiap role.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {MOCK_USERS.map((user) => {
            const Icon = ICON_BY_ROLE[user.role.kode as keyof typeof ICON_BY_ROLE] ?? Stethoscope;
            return (
              <button
                key={user.id}
                type="button"
                onClick={() => selectRole(user)}
                className="text-left border border-border rounded-xl p-4 transition-colors hover:border-teal hover:bg-teal-tint focus:outline-none focus:ring-2 focus:ring-teal"
              >
                <div className="w-10 h-10 rounded-lg bg-teal-tint text-teal-dark flex items-center justify-center mb-3">
                  <Icon size={20} />
                </div>
                <h2 className="font-bold text-[14.5px]">{user.role.nama_tampil}</h2>
                <p className="text-[12.5px] text-slate mt-1">{user.nama}</p>
                <p className="text-[11.5px] text-teal-dark font-semibold mt-3">{user.permissions.length} hak akses</p>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
