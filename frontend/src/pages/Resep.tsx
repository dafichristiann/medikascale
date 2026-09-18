import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Send,
  Plus,
  Trash2,
  UserCheck,
  CheckCircle2,
  Search,
  X,
  ChevronDown,
  Check,
  Pill,
  FileText,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchThreadResep, ubahStatusResep, kirimPesanResep } from '@/api/resep';
import { fetchAntrianHariIni } from '@/api/antrian';
import Chip from '@/components/Chip';
import type { PesanResep, ResepItem, Kunjungan } from '@/types';

export default function Resep() {
  const { user, hasPermission } = useAuth();
  const [searchParams] = useSearchParams();
  const [kunjunganList, setKunjunganList] = useState<Kunjungan[]>([]);
  const [selectedKunjunganId, setSelectedKunjunganId] = useState<number>(103);
  const [thread, setThread] = useState<PesanResep[]>([]);
  const [loading, setLoading] = useState(true);
  const [pesanInput, setPesanInput] = useState('');
  const [itemsObat, setItemsObat] = useState<ResepItem[]>([
    { nama_obat: '', aturan_pakai: '', jumlah: '' },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [notif, setNotif] = useState<string | null>(null);

  // Search & Rekomendasi Kunjungan
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const q = searchQuery.trim().toLowerCase();
  const filteredKunjungan = kunjunganList.filter((k) => {
    if (!q) return true;
    const nama = k.pasien?.nama?.toLowerCase() || '';
    const noRm = k.pasien?.no_rm?.toLowerCase() || '';
    const noAntrian = k.no_antrian?.toLowerCase() || '';
    const layanan = k.layanan?.nama?.toLowerCase() || '';
    return nama.includes(q) || noRm.includes(q) || noAntrian.includes(q) || layanan.includes(q);
  });

  useEffect(() => {
    fetchAntrianHariIni()
      .then((kList) => {
        setKunjunganList(kList);
        const paramId = searchParams.get('kunjungan_id');
        if (paramId) {
          const matched = kList.find((k) => k.id === parseInt(paramId, 10));
          if (matched) setSelectedKunjunganId(matched.id);
        }
      })
      .catch(() => {});
  }, [searchParams]);

  useEffect(() => {
    if (!selectedKunjunganId) return;
    setLoading(true);
    fetchThreadResep(selectedKunjunganId)
      .then(setThread)
      .catch((err) => console.error('Gagal mengambil thread resep:', err))
      .finally(() => setLoading(false));
  }, [selectedKunjunganId]);

  const selectedKunjungan =
    kunjunganList.find((k) => k.id === selectedKunjunganId) ||
    ({
      id: 103,
      no_antrian: 'A03',
      pasien: { id: 3, nama: 'Bilqis Nur Aisyah', no_rm: 'RM-2024-018472' },
    } as Partial<Kunjungan>);

  async function handleUbahStatus(id: number, status: PesanResep['status']) {
    try {
      const updated = await ubahStatusResep(id, status);
      setThread((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
      setNotif(`Status resep berhasil diperbarui menjadi: ${status === 'disiapkan' ? 'Sedang disiapkan' : 'Siap diambil'}.`);
    } catch (err) {
      console.error('Gagal memperbarui status resep:', err);
    }
  }

  function handleAddItem() {
    setItemsObat((prev) => [...prev, { nama_obat: '', aturan_pakai: '', jumlah: '' }]);
  }

  function handleRemoveItem(index: number) {
    setItemsObat((prev) => prev.filter((_, i) => i !== index));
  }

  function handleItemChange(index: number, field: keyof ResepItem, val: string) {
    setItemsObat((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [field]: val } : it)),
    );
  }

  async function handleKirimResep(e: React.FormEvent) {
    e.preventDefault();
    if (!pesanInput.trim() && itemsObat.every((it) => !it.nama_obat.trim())) return;

    setSubmitting(true);
    setNotif(null);
    try {
      const validItems = itemsObat.filter((it) => it.nama_obat.trim().length > 0);
      const baru = await kirimPesanResep({
        kunjungan_id: selectedKunjunganId,
        dari_user: user?.nama ?? 'Dokter',
        ke_user: 'Apoteker',
        isi_pesan: pesanInput.trim() || 'Berikut e-resep untuk pasien ini.',
        resep_item: validItems.length > 0 ? validItems : undefined,
        status: 'terkirim',
      });
      setThread((prev) => [...prev, baru]);
      setPesanInput('');
      setItemsObat([{ nama_obat: '', aturan_pakai: '', jumlah: '' }]);
      setNotif('Resep berhasil dikirim ke loket apotek.');
    } catch (err) {
      console.error('Gagal mengirim resep:', err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-1">
          {hasPermission('resep.proses') ? 'Resep Masuk Farmasi' : 'Pesan & e-Resep Dokter'}
        </h2>
        <p className="text-slate text-[13.5px] max-w-xl">
          Komunikasi klinis terstruktur antara Dokter dan Apoteker. Resep tercatat real-time tanpa resiko hilang.
        </p>
      </div>

      <div className="bg-white border border-border rounded-xl mb-4 p-4 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <UserCheck size={18} className="text-teal" />
            <span className="text-[13px] font-semibold text-ink">Pasien Terpilih:</span>
            {selectedKunjungan && (
              <span className="font-bold text-xs bg-navy-deep text-white px-2 py-0.5 rounded flex items-center gap-1.5">
                <span>{selectedKunjungan.no_antrian}</span>
                <span>·</span>
                <span>{selectedKunjungan.pasien?.nama}</span>
                <span className="font-mono opacity-80">({selectedKunjungan.pasien?.no_rm})</span>
              </span>
            )}
          </div>

          {/* Search Box dengan Autocomplete Dropdown */}
          <div className="relative w-full md:w-96" ref={searchContainerRef}>
            <div className="relative flex items-center">
              <Search size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsOpen(true);
                }}
                placeholder="Cari No. Antrian / Nama / No. RM…"
                className="w-full pl-9 pr-8 py-2 text-xs border border-border rounded-lg bg-bg focus:bg-white focus:outline-none focus:border-teal transition-all"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-slate-400 hover:text-ink p-0.5"
                >
                  <X size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                  className="absolute right-2.5 text-slate-400 hover:text-ink p-0.5"
                >
                  <ChevronDown size={14} />
                </button>
              )}
            </div>

            {/* Dropdown Rekomendasi */}
            {isOpen && (
              <div className="absolute left-0 right-0 mt-1.5 bg-white border border-border rounded-xl shadow-xl z-40 max-h-72 overflow-y-auto divide-y divide-border animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="p-2 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-500" />
                  {searchQuery ? `Hasil Pencarian (${filteredKunjungan.length})` : 'Rekomendasi Antrian Hari Ini'}
                </div>

                {filteredKunjungan.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate">
                    Tidak ditemukan pasien dengan kata kunci &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  filteredKunjungan.map((k) => {
                    const isSelected = k.id === selectedKunjunganId;
                    return (
                      <div
                        key={k.id}
                        onClick={() => {
                          setSelectedKunjunganId(k.id);
                          setSearchQuery('');
                          setIsOpen(false);
                        }}
                        className={`p-2.5 hover:bg-teal-tint/40 cursor-pointer flex items-center justify-between transition-colors ${
                          isSelected ? 'bg-teal-tint/50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-xs bg-navy-deep text-white px-1.5 py-0.5 rounded">
                            {k.no_antrian}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-ink flex items-center gap-1.5">
                              {k.pasien?.nama}
                              {k.prioritas && (
                                <span className="text-[10px] bg-red-100 text-status-red px-1 py-0.2 rounded font-semibold">
                                  Prioritas
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate font-mono">
                              {k.pasien?.no_rm} · {k.layanan?.nama}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10.5px] uppercase font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            {k.status_antrian}
                          </span>
                          {isSelected && <Check size={14} className="text-teal-dark shrink-0" />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {notif && (
        <div className="flex items-center gap-2 bg-teal-tint border border-teal text-teal-dark text-[12.5px] rounded-lg p-2.5 mb-4">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{notif}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Kolom Thread Pesan */}
        <div className={`${hasPermission('resep.kirim') ? 'lg:col-span-6' : 'lg:col-span-12'} bg-white border border-border rounded-2xl overflow-hidden min-h-[520px] flex flex-col shadow-sm`}>
          <div className="px-5 py-4 border-b border-border bg-slate-50/70 flex justify-between items-center">
            <div>
              <b className="text-[14px] text-ink block">
                Thread Resep: {selectedKunjungan?.pasien?.nama}
              </b>
              <span className="text-[12px] text-slate font-mono">
                No. RM: {selectedKunjungan?.pasien?.no_rm} · Layanan: {selectedKunjungan?.layanan?.nama ?? 'Poli Rawat Jalan'}
              </span>
            </div>
            <span className="font-mono font-bold text-xs bg-navy-deep text-white px-2 py-0.5 rounded shadow-2xs">
              {selectedKunjungan?.no_antrian ?? 'A03'}
            </span>
          </div>

          <div className="flex-1 p-5 flex flex-col gap-3.5 overflow-y-auto">
            {loading ? (
              <p className="text-slate text-sm text-center py-8">Memuat thread resep…</p>
            ) : thread.length === 0 ? (
              <p className="text-slate text-sm text-center py-8">Belum ada resep atau pesan untuk kunjungan ini.</p>
            ) : (
              thread.map((p) => {
                const isDokter = p.dari_user.toLowerCase().includes('dr') || p.dari_user.toLowerCase().includes('dokter');
                return (
                  <div
                    key={p.id}
                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-sm ${
                      isDokter
                        ? 'bg-navy-deep text-white self-start rounded-bl-xs'
                        : 'bg-teal-tint text-ink self-end rounded-br-xs border border-teal/30'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[11px] opacity-80 mb-1.5 gap-4">
                      <b>{p.dari_user}</b>
                      <span>{new Date(p.waktu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div>{p.isi_pesan}</div>
                    {p.resep_item && p.resep_item.length > 0 && (
                      <div className="bg-white/10 border border-white/25 rounded-xl p-3 mt-2.5 text-[12px]">
                        <b className="block mb-1 font-bold">Daftar Obat Farmasi:</b>
                        <ul className="space-y-1.5">
                          {p.resep_item.map((it, i) => (
                            <li key={i} className="flex justify-between gap-2 border-b border-white/10 pb-1 last:border-none last:pb-0">
                              <span className="font-medium">• {it.nama_obat}</span>
                              <span className="opacity-90 font-mono text-[11.5px]">{it.aturan_pakai} ({it.jumlah})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="mt-2.5 flex items-center justify-between">
                      <StatusChip status={p.status} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {hasPermission('resep.proses') && thread.length > 0 && (
            <div className="border-t border-border p-4 bg-slate-50/80 flex items-center justify-between flex-wrap gap-2.5">
              <span className="text-[12.5px] text-slate-700 font-bold">Tindak Lanjut Apoteker:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleUbahStatus(thread[thread.length - 1]?.id, 'disiapkan')}
                  className="text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-3.5 py-2 transition shadow-xs"
                >
                  Tandai: Sedang Disiapkan
                </button>
                <button
                  onClick={() => handleUbahStatus(thread[thread.length - 1]?.id, 'siap_diambil')}
                  className="text-xs font-bold bg-teal hover:bg-teal-dark text-white rounded-lg px-3.5 py-2 transition shadow-xs"
                >
                  Tandai: Siap Diambil di Loket
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Kolom Form Input e-Resep untuk Dokter (6 cols) */}
        {hasPermission('resep.kirim') && (
          <div className="lg:col-span-6 bg-white border border-border rounded-2xl p-5 md:p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-tint flex items-center justify-center text-teal-dark">
                    <Pill size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[15.5px] text-ink">Buat &amp; Kirim e-Resep Farmasi</h3>
                    <p className="text-[11.5px] text-slate">Masukkan obat dan petunjuk dosis untuk loket farmasi</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleKirimResep} className="space-y-4">
                {/* Catatan Tambahan untuk Apoteker */}
                <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5">
                  <label className="block text-xs font-bold text-ink mb-1.5 flex items-center gap-1.5">
                    <FileText size={15} className="text-teal" />
                    Catatan / Instruksi Racikan Khusus Apotek:
                  </label>
                  <textarea
                    value={pesanInput}
                    onChange={(e) => setPesanInput(e.target.value)}
                    placeholder="Contoh: Pasien ada riwayat alergi penisilin, racik puyer 10 bungkus diminum sebelum makan..."
                    rows={2}
                    className="w-full bg-white border-2 border-slate-200 focus:border-teal rounded-xl p-3 text-xs font-medium text-ink focus:outline-none transition shadow-2xs resize-none"
                  />
                </div>

                {/* Item Resep Obat */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                      <Pill size={15} className="text-amber-500" />
                      Daftar Obat &amp; Dosis:
                    </label>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="px-3 py-1 text-xs font-bold bg-teal-tint text-teal-dark border border-teal/30 hover:bg-teal hover:text-white rounded-lg transition flex items-center gap-1 shadow-2xs"
                    >
                      <Plus size={14} /> Tambah Baris Obat
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                    {itemsObat.map((it, idx) => (
                      <div key={idx} className="bg-slate-50/70 border-2 border-slate-200/80 rounded-xl p-3.5 space-y-2.5 transition">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-navy-deep text-white text-[10.5px] font-mono flex items-center justify-center">
                              {idx + 1}
                            </span>
                            Obat #{idx + 1}
                          </span>
                          {itemsObat.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-status-red hover:bg-red-50 p-1 rounded-md transition text-xs font-semibold flex items-center gap-1"
                              title="Hapus obat ini"
                            >
                              <Trash2 size={13} /> Hapus
                            </button>
                          )}
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate mb-1">Nama &amp; Sediaan Obat:</label>
                          <input
                            type="text"
                            placeholder="Contoh: Parasetamol Sirup 120mg/5ml / Amoksisilin 500mg"
                            value={it.nama_obat}
                            onChange={(e) => handleItemChange(idx, 'nama_obat', e.target.value)}
                            className="w-full h-10 border-2 border-slate-200 focus:border-teal rounded-lg px-3 py-1.5 text-xs font-bold text-ink bg-white focus:outline-none transition shadow-2xs"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate mb-1">Aturan Pakai / Dosis:</label>
                            <input
                              type="text"
                              placeholder="misal: 3 x 1 cth sesudah makan"
                              value={it.aturan_pakai}
                              onChange={(e) => handleItemChange(idx, 'aturan_pakai', e.target.value)}
                              className="w-full h-9.5 border border-slate-200 focus:border-teal rounded-lg px-3 py-1 text-xs font-semibold bg-white focus:outline-none transition shadow-2xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate mb-1">Jumlah Obat:</label>
                            <input
                              type="text"
                              placeholder="misal: 1 botol / 10 tablet"
                              value={it.jumlah}
                              onChange={(e) => handleItemChange(idx, 'jumlah', e.target.value)}
                              className="w-full h-9.5 border border-slate-200 focus:border-teal rounded-lg px-3 py-1 text-xs font-semibold bg-white focus:outline-none transition shadow-2xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-4 w-full bg-navy-deep hover:bg-navy-mid text-white text-[13.5px] font-bold rounded-xl py-3.5 px-4 flex items-center justify-center gap-2.5 shadow-md transition disabled:opacity-60 active:scale-[0.99]"
                >
                  <Send size={17} className="text-teal-tint" />
                  {submitting ? 'Mengirim e-Resep ke Apotek…' : '⚡ Kirim e-Resep ke Loket Farmasi'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: PesanResep['status'] }) {
  if (status === 'terkirim') return <Chip tone="white">Terkirim</Chip>;
  if (status === 'disiapkan') return <Chip tone="amber">Sedang disiapkan</Chip>;
  return <Chip tone="green">Siap diambil</Chip>;
}
