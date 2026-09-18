import { useEffect, useState } from 'react';
import { fetchPermintaanLab, ubahStatusLab, inputHasilLab } from '@/api/klinis';
import Chip from '@/components/Chip';
import { FileText, CheckCircle2 } from 'lucide-react';
import type { PermintaanLab } from '@/types';

export default function Lab() {
  const [items, setItems] = useState<PermintaanLab[]>([]);
  const [modalItem, setModalItem] = useState<PermintaanLab | null>(null);
  const [viewItem, setViewItem] = useState<any | null>(null);
  const [hasilPemeriksaan, setHasilPemeriksaan] = useState('');
  const [nilaiRujukan, setNilaiRujukan] = useState('');
  const [loading, setLoading] = useState(false);

  const loadData = () => {
    fetchPermintaanLab().then(setItems);
  };

  useEffect(() => {
    loadData();
  }, []);

  async function handleMulai(item: PermintaanLab) {
    const updated = await ubahStatusLab(item.id, 'diproses');
    setItems((prev) =>
      prev.map((p) => (p.id === item.id ? { ...p, status: updated.status ?? 'diproses' } : p)),
    );
  }

  function handleOpenInput(item: PermintaanLab) {
    setModalItem(item);
    setHasilPemeriksaan((item as any).hasil_pemeriksaan || '');
    setNilaiRujukan((item as any).nilai_rujukan || '');
  }

  async function handleSubmitHasil(e: React.FormEvent) {
    e.preventDefault();
    if (!modalItem) return;
    setLoading(true);
    try {
      await inputHasilLab(modalItem.id, {
        hasil_pemeriksaan: hasilPemeriksaan,
        nilai_rujukan: nilaiRujukan,
      });
      setModalItem(null);
      loadData();
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold mb-1">Permintaan lab &amp; radiologi</h2>
        <p className="text-slate text-[13.5px] max-w-xl">
          Alur kerja analis: terima permintaan dokter, proses spesimen, dan inputkan laporan hasil berstruktur.
        </p>
      </div>

      <div className="bg-white border border-border rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[11.5px] uppercase text-slate border-b border-border bg-slate-50">
              <th className="py-3 px-4">No. RM</th>
              <th className="py-3 px-4">Pasien</th>
              <th className="py-3 px-4">Pemeriksaan</th>
              <th className="py-3 px-4">Diminta oleh</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Aksi Analis</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item: any) => (
              <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-4 font-mono font-medium text-slate-700">
                  {item.pasien?.no_rm || '—'}
                </td>
                <td className="py-3 px-4 font-semibold text-ink">{item.pasien?.nama || '—'}</td>
                <td className="py-3 px-4">
                  <div className="font-medium text-ink">{item.pemeriksaan}</div>
                  {item.catatan_dokter && (
                    <div className="text-[11px] text-slate italic">
                      Catatan: {item.catatan_dokter}
                    </div>
                  )}
                </td>
                <td className="py-3 px-4 text-slate">{item.diminta_oleh}</td>
                <td className="py-3 px-4">
                  <StatusChip status={item.status} />
                </td>
                <td className="py-3 px-4 text-right">
                  {item.status === 'menunggu' && (
                    <button
                      onClick={() => handleMulai(item)}
                      className="text-[11.5px] font-semibold bg-white border border-border rounded-md px-2.5 py-1 hover:border-teal text-teal-dark shadow-xs transition-colors"
                    >
                      Mulai Proses
                    </button>
                  )}
                  {item.status === 'diproses' && (
                    <button
                      onClick={() => handleOpenInput(item)}
                      className="text-[11.5px] font-semibold bg-teal hover:bg-teal-dark text-white rounded-md px-3 py-1 shadow-xs transition-colors"
                    >
                      Input Hasil
                    </button>
                  )}
                  {(item.status === 'hasil_siap' || item.status === 'selesai') && (
                    <button
                      onClick={() => setViewItem(item)}
                      className="text-[11.5px] font-semibold text-slate hover:text-teal-dark flex items-center gap-1 ml-auto"
                    >
                      <FileText size={13} /> Lihat Hasil
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Input Hasil Lab */}
      {modalItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-border w-full max-w-lg p-6">
            <h3 className="text-base font-bold text-ink mb-1 flex items-center gap-2">
              <FileText size={18} className="text-teal-dark" /> Input Hasil Pemeriksaan
            </h3>
            <p className="text-xs text-slate mb-4">
              Pasien: <b className="text-ink">{modalItem.pasien?.nama}</b> ({modalItem.pasien?.no_rm}) · {modalItem.pemeriksaan}
            </p>

            <form onSubmit={handleSubmitHasil} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hasil / Interpretasi Temuan
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Contoh: Leukosit: 11.200 /uL (Meningkat ringan), Hb: 12.8 g/dL, Trombosit: 280.000 /uL"
                  value={hasilPemeriksaan}
                  onChange={(e) => setHasilPemeriksaan(e.target.value)}
                  className="w-full border border-border rounded-lg p-2.5 text-sm focus:outline-none focus:border-teal font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nilai Rujukan / Nilai Normal (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Leukosit: 5.000 - 10.000 /uL, Hb: 11.5 - 15.5 g/dL"
                  value={nilaiRujukan}
                  onChange={(e) => setNilaiRujukan(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setModalItem(null)}
                  className="px-4 py-2 border border-border rounded-lg text-sm text-slate hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-teal hover:bg-teal-dark text-white rounded-lg text-sm font-semibold shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 size={15} /> {loading ? 'Menyimpan…' : 'Simpan & Selesai'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Lihat Hasil */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-border w-full max-w-lg p-6">
            <h3 className="text-base font-bold text-ink mb-2">Laporan Hasil Pemeriksaan</h3>
            <div className="text-xs text-slate mb-4 pb-3 border-b border-border">
              Pasien: <b className="text-ink">{viewItem.pasien?.nama}</b> ({viewItem.pasien?.no_rm}) · {viewItem.pemeriksaan}
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-border">
                <div className="font-semibold text-slate-600 mb-1">Hasil:</div>
                <div className="text-ink whitespace-pre-wrap font-mono text-[12.5px] leading-relaxed">
                  {viewItem.hasil_pemeriksaan || 'Belum ada data detail hasil.'}
                </div>
              </div>

              {viewItem.nilai_rujukan && (
                <div className="bg-slate-50 p-3 rounded-lg border border-border">
                  <div className="font-semibold text-slate-600 mb-1">Nilai Rujukan:</div>
                  <div className="text-slate-700 font-mono text-[12px]">{viewItem.nilai_rujukan}</div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 mt-4 border-t border-border">
              <button
                onClick={() => setViewItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusChip({ status }: { status: PermintaanLab['status'] | string }) {
  if (status === 'menunggu') return <Chip tone="grey">Menunggu</Chip>;
  if (status === 'diproses') return <Chip tone="amber">Diproses</Chip>;
  return <Chip tone="green">Hasil siap</Chip>;
}
