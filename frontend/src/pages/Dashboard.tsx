import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import StatCard from '@/components/StatCard';
import Chip from '@/components/Chip';
import { fetchAntrianHariIni } from '@/api/antrian';
import type { Kunjungan } from '@/types';

// Konfigurasi statistik ringkas per kode role. Di dunia nyata sebagian
// angka ini sebaiknya datang dari endpoint agregasi backend
// (mis. GET /dashboard/summary), bukan dihitung di frontend.
const SUBTITLE: Record<string, string> = {
  dokter: 'Pasien menunggu diperiksa & resep yang perlu ditindak.',
  perawat: 'Antrian aktif, antropometri, dan imunisasi yang jatuh tempo.',
  apoteker: 'Resep masuk yang perlu disiapkan.',
  lab_radiologi: 'Permintaan pemeriksaan penunjang.',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [antrian, setAntrian] = useState<Kunjungan[]>([]);

  useEffect(() => {
    fetchAntrianHariIni().then(setAntrian);
  }, []);

  const menunggu = antrian.filter((k) => k.status_antrian === 'putih').length;
  const diperiksa = antrian.filter((k) => k.status_antrian === 'kuning').length;
  const prioritas = antrian.filter((k) => k.prioritas).length;

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold mb-1">Selamat datang, {user?.nama}</h2>
        <p className="text-slate text-[13.5px]">{SUBTITLE[user?.role.kode ?? ''] ?? 'Ringkasan aktivitas hari ini.'}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
        <StatCard label="Pasien hari ini" value={antrian.length} accent="teal" />
        <StatCard label="Menunggu (putih)" value={menunggu} accent="grey" hint="Belum ditimbang" />
        <StatCard label="Sedang diperiksa" value={diperiksa} accent="amber" />
        <StatCard label="Prioritas aktif" value={prioritas} accent="red" />
      </div>

      <div className="bg-white border border-border rounded-xl shadow-card">
        <div className="px-4.5 py-4 border-b border-border">
          <h3 className="font-bold text-[14.5px]">Antrian hari ini</h3>
        </div>
        <div className="p-4 overflow-x-auto">
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
        </div>
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: Kunjungan['status_antrian'] }) {
  const map = {
    putih: { tone: 'white' as const, label: 'Terdaftar' },
    hijau: { tone: 'green' as const, label: 'Ditimbang' },
    kuning: { tone: 'amber' as const, label: 'Diperiksa' },
    merah: { tone: 'red' as const, label: 'Dapat resep' },
  };
  const m = map[status];
  return <Chip tone={m.tone}>{m.label}</Chip>;
}
