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
  Clock,
  PackageCheck,
  Filter,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchThreadResep, fetchAllResep, ubahStatusResep, kirimPesanResep } from '@/api/resep';
import { fetchAntrianHariIni } from '@/api/antrian';
import Chip from '@/components/Chip';
import type { PesanResep, ResepItem, Kunjungan } from '@/types';

export default function Resep() {
  const { user, hasPermission } = useAuth();
  const [searchParams] = useSearchParams();
  const [kunjunganList, setKunjunganList] = useState<Kunjungan[]>([]);
  const [selectedKunjunganId, setSelectedKunjunganId] = useState<number>(0);
  const [allResepList, setAllResepList] = useState<PesanResep[]>([]);
  const [loading, setLoading] = useState(true);
  const [pesanInput, setPesanInput] = useState('');
  const [itemsObat, setItemsObat] = useState<ResepItem[]>([
    { nama_obat: '', aturan_pakai: '', jumlah: '' },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [notif, setNotif] = useState<string | null>(null);


  // Tab mode jika user memiliki kedua akses (misal Admin)
  const isApotekerOnly = hasPermission('resep.proses') && !hasPermission('resep.kirim');
  const isDokterOnly = hasPermission('resep.kirim') && !hasPermission('resep.proses');
  const [activeTab, setActiveTab] = useState<'apoteker' | 'dokter'>(
    isApotekerOnly ? 'apoteker' : 'dokter'
  );

  // Filter & Search untuk Apoteker
  const [statusFilter, setStatusFilter] = useState<'semua' | 'diserahkan'>('semua');
  const [apotekerSearch, setApotekerSearch] = useState('');
  const [submittingKunjunganId, setSubmittingKunjunganId] = useState<number | null>(null);

  // Search Pasien untuk Form Dokter
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Handle click outside search box
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Muat daftar antrian hari ini
  useEffect(() => {
    fetchAntrianHariIni()
      .then((kList) => {
        setKunjunganList(kList);
        const paramId = searchParams.get('kunjungan_id');
        if (paramId) {
          const matched = kList.find((k) => k.id === parseInt(paramId, 10));
          if (matched) setSelectedKunjunganId(matched.id);
          else if (kList.length > 0) setSelectedKunjunganId(kList[0].id);
        } else if (kList.length > 0) {
          setSelectedKunjunganId(kList[0].id);
        }
      })
      .catch(() => {});
  }, [searchParams]);

  // Muat seluruh resep farmasi untuk Apoteker
  const loadAllResep = () => {
    setLoading(true);
    fetchAllResep()
      .then((res) => {
        setAllResepList(res);
      })
      .catch((err) => console.error('Gagal mengambil daftar resep:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAllResep();
  }, [selectedKunjunganId]);

  const selectedKunjungan =
    kunjunganList.find((k) => k.id === selectedKunjunganId) ||
    (kunjunganList.length > 0 ? kunjunganList[0] : null);

  const q = searchQuery.trim().toLowerCase();
  const filteredKunjungan = kunjunganList.filter((k) => {
    if (!q) return true;
    const nama = k.pasien?.nama?.toLowerCase() || '';
    const noRm = k.pasien?.no_rm?.toLowerCase() || '';
    const noAntrian = k.no_antrian?.toLowerCase() || '';
    const layanan = k.layanan?.nama?.toLowerCase() || '';
    return nama.includes(q) || noRm.includes(q) || noAntrian.includes(q) || layanan.includes(q);
  });

  async function handleSelesaikanPenyerahan(card: PatientResepCardData) {
    setSubmittingKunjunganId(card.kunjunganId);
    try {
      // 1. Eksekusi pembaruan status ke 'diserahkan' untuk seluruh item resep pasien ini
      const promises = card.pesanList.map((p) => ubahStatusResep(p.id, 'diserahkan'));
      await Promise.all(promises);

      // 2. Perbarui state lokal secara instan
      setAllResepList((prev) =>
        prev.map((item) =>
          item.kunjungan_id === card.kunjunganId
            ? { ...item, status: 'diserahkan' }
            : item
        )
      );

      // 3. Perbarui antrean pasien ke 'selesai' di state
      setKunjunganList((prev) =>
        prev.map((k) =>
          k.id === card.kunjunganId
            ? { ...k, status_antrian: 'selesai' }
            : k
        )
      );

      const patientName = card.kunjungan?.pasien?.nama ?? `Pasien #${card.kunjunganId}`;
      setNotif(`Resep obat untuk ${patientName} berhasil diselesaikan & diserahkan ke pasien (Antrian Selesai).`);

      // 4. Muat ulang data terbaru dari server
      loadAllResep();
    } catch (err) {
      console.error('Gagal menyelesaikan penyerahan resep:', err);
      setNotif('Gagal menyelesaikan penyerahan resep. Silakan coba kembali.');
    } finally {
      setSubmittingKunjunganId(null);
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
    if (!selectedKunjunganId) {
      setNotif('Silakan pilih kunjungan pasien terlebih dahulu.');
      return;
    }
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
      setAllResepList((prev) => [baru, ...prev]);
      setPesanInput('');
      setItemsObat([{ nama_obat: '', aturan_pakai: '', jumlah: '' }]);
      setNotif('e-Resep berhasil dikirim ke instalasi farmasi.');
      loadAllResep();
    } catch (err) {
      console.error('Gagal mengirim resep:', err);
    } finally {
      setSubmitting(false);
    }
  }

  // Kelompokkan Resep per Pasien/Kunjungan untuk Apoteker
  interface PatientResepCardData {
    kunjunganId: number;
    kunjungan: Kunjungan | null;
    pesanList: PesanResep[];
    isSelesai: boolean;
    latestWaktu: string;
    totalObat: number;
  }

  const groupedByPatient: PatientResepCardData[] = [];
  const mapGroup = new Map<number, PatientResepCardData>();

  for (const item of allResepList) {
    const kId = item.kunjungan_id;
    if (!mapGroup.has(kId)) {
      const matchedKunjungan = item.kunjungan || kunjunganList.find((k) => k.id === kId) || null;
      mapGroup.set(kId, {
        kunjunganId: kId,
        kunjungan: matchedKunjungan,
        pesanList: [],
        isSelesai: false,
        latestWaktu: item.waktu,
        totalObat: 0,
      });
    }

    const group = mapGroup.get(kId)!;
    group.pesanList.push(item);
    if (item.resep_item) group.totalObat += item.resep_item.length;
    if (new Date(item.waktu) > new Date(group.latestWaktu)) {
      group.latestWaktu = item.waktu;
    }
  }

  mapGroup.forEach((group) => {
    // Selesai jika seluruh item resep telah berstatus diserahkan/selesai
    const allResepDiserahkan =
      group.pesanList.length > 0 &&
      group.pesanList.every((p) => p.status === 'diserahkan' || p.status === 'selesai');
    const antrianSelesai = group.kunjungan?.status_antrian === 'selesai';

    group.isSelesai = allResepDiserahkan || antrianSelesai;
    groupedByPatient.push(group);
  });

  // Filter pencarian & status untuk Apoteker (Semua Pasien = Antrean Resep Aktif; Selesai = Diserahkan)
  const filteredPatientCards = groupedByPatient.filter((card) => {
    // Pada tab 'semua' (Semua Pasien): hanya tampilkan yang belum diserahkan.
    // Begitu diserahkan, langsung pindah dan tidak ada lagi di tab ini!
    if (statusFilter === 'semua' && card.isSelesai) return false;
    // Pada tab 'diserahkan' (Selesai Diserahkan): hanya tampilkan yang sudah selesai diserahkan.
    if (statusFilter === 'diserahkan' && !card.isSelesai) return false;

    // filter search
    if (!apotekerSearch.trim()) return true;
    const query = apotekerSearch.toLowerCase();
    const nama = card.kunjungan?.pasien?.nama?.toLowerCase() || '';
    const noRm = card.kunjungan?.pasien?.no_rm?.toLowerCase() || '';
    const noAntrian = card.kunjungan?.no_antrian?.toLowerCase() || '';
    const obatNames = card.pesanList
      .flatMap((p) => p.resep_item?.map((it) => it.nama_obat.toLowerCase()) || [])
      .join(' ');

    return nama.includes(query) || noRm.includes(query) || noAntrian.includes(query) || obatNames.includes(query);
  });

  // Hitung jumlah
  const countAktif = groupedByPatient.filter((c) => !c.isSelesai).length;
  const countDiserahkan = groupedByPatient.filter((c) => c.isSelesai).length;

  return (
    <div className="space-y-4">
      {/* Header Utama & Tab Switcher jika memiliki kedua akses */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-ink">
            <Pill className="text-teal" size={24} />
            {hasPermission('resep.proses') && !hasPermission('resep.kirim')
              ? 'Instalasi Farmasi · Resep Masuk per Pasien'
              : 'Resep Obat & Komunikasi Farmasi'}
          </h2>
          <p className="text-slate text-[13px] max-w-xl">
            Pengelolaan e-resep terstruktur antara Dokter dan Apoteker tanpa resiko resep hilang atau salah baca.
          </p>
        </div>

        {/* Tab switcher untuk admin / user dengan kedua akses */}
        {hasPermission('resep.proses') && hasPermission('resep.kirim') && (
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1 self-start sm:self-auto border border-border">
            <button
              type="button"
              onClick={() => setActiveTab('apoteker')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'apoteker'
                  ? 'bg-white text-teal-dark shadow-xs border border-teal/20'
                  : 'text-slate-600 hover:text-ink'
              }`}
            >
              <PackageCheck size={14} /> Resep Masuk Farmasi ({countAktif})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('dokter')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'dokter'
                  ? 'bg-white text-teal-dark shadow-xs border border-teal/20'
                  : 'text-slate-600 hover:text-ink'
              }`}
            >
              <FileText size={14} /> Buat e-Resep Dokter
            </button>
          </div>
        )}
      </div>

      {notif && (
        <div className="flex items-center gap-2.5 bg-teal-tint border border-teal text-teal-dark text-[12.5px] rounded-xl p-3 shadow-2xs animate-in fade-in">
          <CheckCircle2 size={16} className="shrink-0" />
          <span className="font-medium">{notif}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAMPILAN APOTEKER: RESEP MASUK DIPISAH PER PASIEN                         */}
      {/* ========================================================================= */}
      {hasPermission('resep.proses') && (isApotekerOnly || activeTab === 'apoteker') && (
        <div className="space-y-4">
          {/* Bar Filter Status & Kotak Pencarian Resep */}
          <div className="bg-white border border-border rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Filter Status Pills: Hanya Semua Pasien dan Selesai Diserahkan */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setStatusFilter('semua')}
                className={`text-xs px-3.5 py-1.5 rounded-lg font-bold border transition-all cursor-pointer ${
                  statusFilter === 'semua'
                    ? 'bg-navy-deep text-white border-navy-deep shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-border hover:bg-slate-100'
                }`}
              >
                Semua Pasien ({countAktif})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('diserahkan')}
                className={`text-xs px-3.5 py-1.5 rounded-lg font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === 'diserahkan'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <CheckCircle2 size={13} className={statusFilter === 'diserahkan' ? 'text-white' : 'text-emerald-600'} />
                Selesai Diserahkan ({countDiserahkan})
              </button>
            </div>

            {/* Pencarian Khusus Apotek */}
            <div className="relative w-full md:w-80">
              <Search size={15} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={apotekerSearch}
                onChange={(e) => setApotekerSearch(e.target.value)}
                placeholder="Cari pasien / no. tiket / nama obat…"
                className="w-full pl-9 pr-8 py-2 text-xs border border-border rounded-xl bg-bg focus:bg-white focus:outline-none focus:border-teal transition-all shadow-2xs"
              />
              {apotekerSearch && (
                <button
                  type="button"
                  onClick={() => setApotekerSearch('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-ink"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Grid Kartu Resep per Pasien */}
          {loading ? (
            <div className="bg-white border border-border rounded-2xl p-12 text-center shadow-xs">
              <p className="text-slate text-sm">Memuat daftar resep masuk…</p>
            </div>
          ) : filteredPatientCards.length === 0 ? (
            <div className="bg-white border border-border rounded-2xl p-12 text-center shadow-xs">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-3">
                <CheckCircle2 size={24} />
              </div>
              <h4 className="font-bold text-ink text-sm mb-1">
                {statusFilter === 'semua' ? 'Semua Resep Telah Selesai Diserahkan' : 'Belum Ada Resep Selesai'}
              </h4>
              <p className="text-slate text-xs max-w-sm mx-auto">
                {apotekerSearch
                  ? `Tidak ada resep yang cocok dengan kata kunci "${apotekerSearch}".`
                  : statusFilter === 'semua'
                  ? 'Tidak ada antrean resep obat aktif. Semua pasien telah menerima obat atau sedang menunggu resep baru dari dokter.'
                  : 'Belum ada resep yang ditandai selesai diserahkan hari ini.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPatientCards.map((card) => {
                const latestResep = card.pesanList[0] || card.pesanList[card.pesanList.length - 1];
                const isSelesai = card.isSelesai;

                return (
                  <div
                    key={card.kunjunganId}
                    className={`bg-white border-2 rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between ${
                      isSelesai
                        ? 'border-emerald-200/90 bg-emerald-50/15'
                        : 'border-slate-200 hover:border-teal/50'
                    }`}
                  >
                    <div>
                      {/* Header Pasien & Nomor Antrian */}
                      <div className="flex items-start justify-between gap-3 border-b border-border pb-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-sm bg-navy-deep text-white px-2.5 py-1 rounded-lg shadow-2xs">
                            {card.kunjungan?.no_antrian ?? `K#${card.kunjunganId}`}
                          </span>
                          <div>
                            <h4 className="font-bold text-sm text-ink leading-tight">
                              {card.kunjungan?.pasien?.nama ?? `Pasien #${card.kunjunganId}`}
                            </h4>
                            <p className="text-[11px] text-slate font-mono mt-0.5">
                              {card.kunjungan?.pasien?.no_rm ?? '-'} · {card.kunjungan?.layanan?.nama ?? 'Poli Anak'}
                            </p>
                          </div>
                        </div>

                        {/* Status Badge jika sudah selesai */}
                        {isSelesai && (
                          <div className="shrink-0">
                            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/90 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs">
                              <CheckCircle2 size={13} className="text-emerald-600" /> Selesai Diserahkan
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info Dokter & Waktu Resep */}
                      <div className="flex items-center justify-between text-[11.5px] text-slate mb-3 px-1">
                        <span>
                          Dokter: <b>{latestResep?.dari_user ?? 'dr. Spesialis'}</b>
                        </span>
                        <span className="font-mono text-slate-500">
                          {new Date(card.latestWaktu).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })} WIB
                        </span>
                      </div>

                      {/* Catatan Dokter jika ada */}
                      {latestResep?.isi_pesan && (
                        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 mb-3 text-[12px] text-slate-700">
                          <span className="font-bold text-ink block mb-0.5 text-[11px] uppercase tracking-wider">
                            Catatan Khusus Dokter:
                          </span>
                          {latestResep.isi_pesan}
                        </div>
                      )}

                      {/* Daftar Item Obat Pasien Tersebut */}
                      <div className="mb-4">
                        <div className="text-xs font-bold text-ink mb-1.5 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Pill size={14} className="text-teal" />
                            Daftar Obat Pasien ({card.totalObat} item):
                          </span>
                        </div>

                        <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl divide-y divide-slate-200/80 overflow-hidden">
                          {card.pesanList.flatMap((p) => p.resep_item || []).length === 0 ? (
                            <div className="p-3 text-xs text-slate italic">
                              Tidak ada rincian item obat tertulis.
                            </div>
                          ) : (
                            card.pesanList.flatMap((p, pIdx) =>
                              (p.resep_item || []).map((it, itIdx) => (
                                <div key={`${pIdx}-${itIdx}`} className="p-2.5 px-3.5 flex items-center justify-between text-xs">
                                  <div>
                                    <span className="font-bold text-ink block">• {it.nama_obat}</span>
                                    <span className="text-[11px] text-slate-600">{it.aturan_pakai}</span>
                                  </div>
                                  <span className="font-bold font-mono text-[11px] bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs text-teal-dark">
                                    {it.jumlah}
                                  </span>
                                </div>
                              ))
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tombol Aksi Apoteker untuk Pasien Ini */}
                    <div className="pt-3 border-t border-border flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[11.5px] font-semibold text-slate">Status Penyerahan Obat:</span>
                      <div className="flex items-center gap-2">
                        {!isSelesai ? (
                          <button
                            type="button"
                            disabled={submittingKunjunganId === card.kunjunganId}
                            onClick={() => handleSelesaikanPenyerahan(card)}
                            className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl px-4 py-2 transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                          >
                            <CheckCircle2 size={15} />
                            {submittingKunjunganId === card.kunjunganId ? 'Memproses…' : 'Selesaikan Penyerahan'}
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/90 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs">
                              <CheckCircle2 size={15} className="text-emerald-600" /> Selesai Diserahkan
                            </span>
                            <button
                              type="button"
                              onClick={() => handleSelesaikanPenyerahan(card)}
                              title="Klik untuk memperbarui kembali penyerahan"
                              className="text-[11px] text-slate-500 hover:text-emerald-700 hover:underline cursor-pointer px-1"
                            >
                              Perbarui
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAMPILAN DOKTER: FORM BUAT & KIRIM e-RESEP                                */}
      {/* ========================================================================= */}
      {hasPermission('resep.kirim') && (isDokterOnly || activeTab === 'dokter') && (
        <div className="w-full max-w-4xl mx-auto space-y-4">
          {/* Card Pemilih Pasien Terdaftar */}
          <div className="bg-white border border-border rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-tint flex items-center justify-center text-teal-dark font-bold text-xs">
                <UserCheck size={18} />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate uppercase tracking-wider block">Pasien Tujuan Resep:</span>
                {selectedKunjungan ? (
                  <div className="flex items-center gap-2 font-bold text-sm text-ink">
                    <span className="font-mono bg-navy-deep text-white px-2 py-0.5 rounded text-xs">
                      {selectedKunjungan.no_antrian}
                    </span>
                    <span>{selectedKunjungan.pasien?.nama}</span>
                    <span className="font-mono text-slate text-xs font-normal">
                      ({selectedKunjungan.pasien?.no_rm})
                    </span>
                    <span className="text-xs text-slate-500 font-normal">
                      · {selectedKunjungan.layanan?.nama}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-slate italic">Pilih pasien dari antrian hari ini</span>
                )}
              </div>
            </div>

            {/* Search Combobox Pasien */}
            <div className="relative w-full md:w-80" ref={searchContainerRef}>
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setIsOpen(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsOpen(true);
                  }}
                  placeholder="Cari No. Antrian / Nama Pasien…"
                  className="w-full pl-8 pr-8 py-1.5 text-xs border border-border rounded-xl bg-bg focus:bg-white focus:outline-none focus:border-teal transition-all shadow-2xs"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 text-slate-400 hover:text-ink p-0.5"
                  >
                    <X size={13} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute right-2 text-slate-400 hover:text-ink p-0.5"
                  >
                    <ChevronDown size={14} />
                  </button>
                )}
              </div>

              {/* Dropdown Hasil Pencarian */}
              {isOpen && (
                <div className="absolute left-0 right-0 mt-1.5 bg-white border border-border rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto divide-y divide-border animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="p-2 bg-slate-50 text-[10.5px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Pill size={12} className="text-teal" />
                    {searchQuery ? `Hasil Pencarian (${filteredKunjungan.length})` : 'Antrian Pasien Hari Ini'}
                  </div>

                  {filteredKunjungan.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate">
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
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs bg-navy-deep text-white px-1.5 py-0.5 rounded">
                              {k.no_antrian}
                            </span>
                            <div>
                              <div className="text-xs font-bold text-ink">{k.pasien?.nama}</div>
                              <div className="text-[11px] text-slate font-mono">
                                {k.pasien?.no_rm} · {k.layanan?.nama}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] uppercase font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">
                              {k.status_antrian}
                            </span>
                            {isSelected && <Check size={14} className="text-teal-dark" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Form Buat & Kirim e-Resep */}
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5 border-b border-border pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-tint flex items-center justify-center text-teal-dark">
                  <Pill size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-[16px] text-ink">Buat &amp; Kirim e-Resep Farmasi</h3>
                  <p className="text-xs text-slate">Masukkan obat dan petunjuk dosis untuk dikirim langsung ke instalasi farmasi</p>
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

                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
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
  );
}
