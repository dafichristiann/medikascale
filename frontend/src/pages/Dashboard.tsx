import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessagesSquare, FlaskConical } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import StatCard from '@/components/StatCard';
import Chip from '@/components/Chip';
import { fetchAntrianHariIni } from '@/api/antrian';
import { fetchDashboardSummary } from '@/api/dashboard';
import type { Kunjungan, DashboardSummary } from '@/types';

const SUBTITLE: Record<string, string> = {
  dokter: 'Pasien menunggu diperiksa & resep yang perlu ditindak.',
  perawat: 'Antrian aktif, antropometri, dan imunisasi yang jatuh tempo.',
  apoteker: 'Resep masuk yang perlu disiapkan.',
  lab_radiologi: 'Permintaan pemeriksaan penunjang.',
};

export default function Dashboard() {
  const { user, hasPermission } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [antrian, setAntrian] = useState<Kunjungan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardSummary()
      .then(setSummary)
      .catch((err) => console.error('Gagal memuat summary dashboard:', err));

    if (hasPermission('antrian.view')) {
      fetchAntrianHariIni()
        .then(setAntrian)
        .catch((err) => console.error('Gagal memuat antrian:', err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [hasPermission]);

  const totalPasien = summary?.total_pasien ?? antrian.length;
  const menunggu = summary?.menunggu_putih ?? antrian.filter((k) => k.status_antrian === 'putih').length;
  const diperiksa = summary?.sedang_diperiksa_kuning ?? antrian.filter((k) => k.status_antrian === 'kuning').length;
  const prioritas = summary?.prioritas_aktif ?? antrian.filter((k) => k.prioritas).length;

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold mb-1">Selamat datang, {user?.nama}</h2>
        <p className="text-slate text-[13.5px]">{SUBTITLE[user?.role.kode ?? ''] ?? 'Ringkasan aktivitas hari ini.'}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
        <StatCard label="Pasien hari ini" value={totalPasien} accent="teal" />
        <StatCard label="Menunggu (putih)" value={menunggu} accent="grey" hint="Belum ditimbang" />
        <StatCard label="Sedang diperiksa" value={diperiksa} accent="amber" />
        <StatCard label="Prioritas aktif" value={prioritas} accent="red" />
      </div>

      {hasPermission('antrian.view') ? (
        <div className="bg-white border border-border rounded-xl shadow-card">
          <div className="px-4.5 py-4 border-b border-border flex justify-between items-center">
            <h3 className="font-bold text-[14.5px]">Antrian hari ini</h3>
            <span className="text-[12px] text-slate">{antrian.length} pasien terdaftar</span>
          </div>
          <div className="p-4 overflow-x-auto">
            {loading ? (
              <p className="text-[13px] text-slate py-4 text-center">Memuat data antrian…</p>
            ) : antrian.length === 0 ? (
              <p className="text-[13px] text-slate py-4 text-center">Belum ada pasien hari ini.</p>
            ) : (
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left text-[11.5px] uppercase text-slate">
                    <th className="py-2 px-2.5">No.</th>
                    <th className="py-2 px-2.5">Nama</th>
                    <th className="py-2 px-2.5">Layanan</th>
                    <th className="py-2 px-2.5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {antrian.map((k) => (
                    <tr key={k.id} className="border-t border-border">
                      <td className="py-2.5 px-2.5 font-mono font-semibold">{k.no_antrian}</td>
                      <td className="py-2.5 px-2.5">{k.pasien.nama}</td>
                      <td className="py-2.5 px-2.5">{k.layanan.nama}</td>
                      <td className="py-2.5 px-2.5">
                        <StatusChip status={k.status_antrian} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl p-6 shadow-card">
          <h3 className="font-bold text-[15px] mb-2">Pusat Kerja {user?.role.nama_tampil}</h3>
          <p className="text-slate text-[13px] mb-4">
            Anda masuk dengan hak akses khusus modul penunjang klinik. Silakan akses menu kerja Anda:
          </p>
          <div className="flex flex-wrap gap-3">
            {hasPermission('resep.proses') && (
              <Link
                to="/resep"
                className="flex items-center gap-2 bg-teal hover:bg-teal-dark text-white px-4 py-2.5 rounded-lg text-[13px] font-semibold"
              >
                <MessagesSquare size={16} /> Buka Resep Masuk Farmasi
              </Link>
            )}
            {hasPermission('lab.kelola') && (
              <Link
                to="/lab"
                className="flex items-center gap-2 bg-teal hover:bg-teal-dark text-white px-4 py-2.5 rounded-lg text-[13px] font-semibold"
              >
                <FlaskConical size={16} /> Buka Pemeriksaan Lab &amp; Radiologi
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusChip({ status }: { status: Kunjungan['status_antrian'] }) {
  const map = {
    putih: { tone: 'white' as const, label: 'Terdaftar' },
    hijau: { tone: 'green' as const, label: 'Ditimbang' },
    kuning: { tone: 'amber' as const, label: 'Diperiksa' },
    merah: { tone: 'red' as const, label: 'Dapat resep' },
    selesai: { tone: 'blue' as const, label: 'Selesai' },
  };
  const m = map[status] || { tone: 'white' as const, label: status };
  return <Chip tone={m.tone}>{m.label}</Chip>;
}
