import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  fetchAntrianHariIni,
  ubahStatusAntrian,
  prioritaskanAntrian,
  urutkanAntrian,
  URUTAN_STATUS,
} from '@/api/antrian';
import type { Kunjungan, StatusAntrian } from '@/types';

const META: Record<StatusAntrian, { label: string; dot: string }> = {
  putih: { label: 'Terdaftar', dot: 'bg-slate-400' },
  hijau: { label: 'Ditimbang', dot: 'bg-status-green' },
  kuning: { label: 'Diperiksa', dot: 'bg-status-amber' },
  merah: { label: 'Dapat resep', dot: 'bg-status-red' },
};

export default function Antrian() {
  const { hasPermission } = useAuth();
  const [items, setItems] = useState<Kunjungan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAntrianHariIni()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  async function handlePrioritaskan(id: number) {
    const updated = await prioritaskanAntrian(id);
    setItems((prev) => prev.map((k) => (k.id === id ? updated : k)));
  }

  async function handleLanjut(k: Kunjungan) {
    const idx = URUTAN_STATUS.indexOf(k.status_antrian);
    if (idx >= URUTAN_STATUS.length - 1) return;
    const updated = await ubahStatusAntrian(k.id, URUTAN_STATUS[idx + 1]);
    setItems((prev) => prev.map((x) => (x.id === k.id ? updated : x)));
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-1">Antrian pasien</h2>
        <p className="text-slate text-[13.5px] max-w-xl">
          Antrian fleksibel: pasien bisa didahulukan sesuai kebutuhan klinis tanpa mengubah nomor antrian yang sudah dibagikan.
        </p>
      </div>

      <div className="bg-teal-tint border border-teal text-teal-dark text-[12.5px] rounded-lg px-3.5 py-2.5 mb-5 leading-relaxed">
        Nomor antrian bersifat tetap (looping A01–A99). Yang berubah hanya <b>urutan pelayanan</b> —
        pasien dengan flag prioritas dilayani lebih dulu di kolom yang sama tanpa mengubah nomornya.
      </div>

      {loading ? (
        <p className="text-slate text-sm">Memuat antrian…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {URUTAN_STATUS.map((status) => {
            const kolom = urutkanAntrian(items.filter((k) => k.status_antrian === status));
            return (
              <div key={status} className="bg-white border border-border rounded-xl">
                <div className="px-3.5 py-3 border-b border-border flex items-center justify-between">
                  <b className="text-[13px] flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded ${META[status].dot}`} />
                    {META[status].label}
                  </b>
                  <span className="text-[11px] text-slate">{kolom.length}</span>
                </div>
                <div className="p-2.5 flex flex-col gap-2 min-h-[120px]">
                  {kolom.length === 0 && (
                    <div className="text-[12px] text-slate p-2.5">Tidak ada pasien</div>
                  )}
                  {kolom.map((k) => (
                    <div key={k.id} className="border border-border rounded-lg p-2.5 bg-bg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-[12.5px] bg-navy-deep text-white px-1.5 py-0.5 rounded">
                          {k.no_antrian}
                        </span>
                        <span className="text-[11px] text-slate">
                          {new Date(k.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="font-semibold text-[13px]">{k.pasien.nama}</div>
                      <div className="text-[11.5px] text-slate">{k.layanan.nama}</div>
                      {k.prioritas && (
                        <div className="flex items-center gap-1 text-[10.5px] font-bold text-status-red mt-1">
                          <Star size={11} fill="currentColor" /> Prioritas
                        </div>
                      )}
                      <div className="flex gap-1.5 mt-2">
                        {!k.prioritas && hasPermission('antrian.prioritaskan') && (
                          <button
                            onClick={() => handlePrioritaskan(k.id)}
                            className="text-[11.5px] font-semibold border border-border rounded-md px-2 py-1 hover:border-teal"
                          >
                            Prioritaskan
                          </button>
                        )}
                        {status !== 'merah' && hasPermission('antrian.ubah_status') && (
                          <button
                            onClick={() => handleLanjut(k)}
                            className="text-[11.5px] font-semibold bg-teal text-white rounded-md px-2 py-1 hover:bg-teal-dark"
                          >
                            Lanjut
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
