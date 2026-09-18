import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Printer,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Search,
  X,
  ChevronDown,
  RotateCcw,
  Activity,
  Calendar,
  Sparkles,
  Award,
  Scale,
  Ruler,
  BrainCircuit,
  FileSpreadsheet,
} from 'lucide-react';
import { simpanAntropometri, fetchAntropometriByKunjungan } from '@/api/klinis';
import { fetchAntrianHariIni } from '@/api/antrian';
import type { AntropometriPengukuran, Kunjungan } from '@/types';
import WhoGrowthChart from '@/components/WhoGrowthChart';

export default function Antropometri() {
  const [searchParams] = useSearchParams();
  const [kunjunganList, setKunjunganList] = useState<Kunjungan[]>([]);
  const [selectedKunjunganId, setSelectedKunjunganId] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Form Inputs
  const [usiaBulan, setUsiaBulan] = useState(12);
  const [bb, setBb] = useState('');
  const [tb, setTb] = useState('');
  const [lk, setLk] = useState('');
  const [manualGender, setManualGender] = useState<'Laki-laki' | 'Perempuan' | null>(null);

  // Status & Feedback
  const [hasil, setHasil] = useState<AntropometriPengukuran | null>(null);
  const [saving, setSaving] = useState(false);
  const [pesanSukses, setPesanSukses] = useState<string | null>(null);
  const [errorPesan, setErrorPesan] = useState<string | null>(null);

  // Load list antrian hari ini
  useEffect(() => {
    fetchAntrianHariIni()
      .then((items) => {
        setKunjunganList(items);
        const paramId = searchParams.get('kunjungan_id');
        if (paramId) {
          const matched = items.find((k) => k.id === parseInt(paramId, 10));
          if (matched) setSelectedKunjunganId(matched.id);
          else if (items.length > 0) setSelectedKunjunganId(items[0].id);
        } else if (items.length > 0) {
          setSelectedKunjunganId(items[0].id);
        }
      })
      .catch(() => {});
  }, [searchParams]);

  // Handle click outside patient search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedKunjungan =
    kunjunganList.find((k) => k.id === selectedKunjunganId) ||
    (kunjunganList.length > 0 ? kunjunganList[0] : null);

  // Resolve gender
  const currentGender: 'Laki-laki' | 'Perempuan' =
    manualGender ||
    selectedKunjungan?.pasien?.jenis_kelamin ||
    (selectedKunjungan?.pasien?.nama?.toLowerCase().includes('bilqis') ||
    selectedKunjungan?.pasien?.nama?.toLowerCase().includes('siti')
      ? 'Perempuan'
      : 'Laki-laki');

  // Auto-calculate age in months when selected patient changes if birth date exists
  useEffect(() => {
    if (selectedKunjungan?.pasien?.tanggal_lahir) {
      try {
        const birth = new Date(selectedKunjungan.pasien.tanggal_lahir);
        const now = new Date();
        const diffMonths =
          (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
        if (diffMonths >= 0 && diffMonths <= 60) {
          setUsiaBulan(diffMonths);
        }
      } catch {
        // Fallback to default
      }
    }
  }, [selectedKunjunganId, selectedKunjungan?.pasien?.tanggal_lahir]);

  // Load existing anthropometry for selected visit
  useEffect(() => {
    if (!selectedKunjunganId) return;
    fetchAntropometriByKunjungan(selectedKunjunganId)
      .then((list) => {
        if (list && list.length > 0) {
          const data = list[0];
          setHasil(data);
          setBb(String(data.berat_badan_kg));
          setTb(String(data.tinggi_badan_cm));
          if (data.lingkar_kepala_cm) setLk(String(data.lingkar_kepala_cm));
          if (data.usia_bulan) setUsiaBulan(data.usia_bulan);
        } else {
          setHasil(null);
        }
      })
      .catch(() => {});
  }, [selectedKunjunganId]);

  // Filtered patients for search box
  const filteredKunjungan = kunjunganList.filter((k) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      k.no_antrian?.toLowerCase().includes(q) ||
      k.pasien?.nama?.toLowerCase().includes(q) ||
      k.pasien?.no_rm?.toLowerCase().includes(q) ||
      k.layanan?.nama?.toLowerCase().includes(q)
    );
  });

  async function handleSimpan() {
    setSaving(true);
    setPesanSukses(null);
    setErrorPesan(null);

    const bbNum = parseFloat(bb);
    const tbNum = parseFloat(tb);
    const lkNum = parseFloat(lk) || undefined;

    if (!bbNum || bbNum <= 0 || !tbNum || tbNum <= 0) {
      setErrorPesan('Berat badan dan tinggi badan harus lebih besar dari 0.');
      setSaving(false);
      return;
    }

    try {
      const result = await simpanAntropometri({
        kunjungan_id: selectedKunjungan?.id ?? 103,
        pasien_id: selectedKunjungan?.pasien?.id ?? 3,
        usia_bulan: usiaBulan,
        berat_badan_kg: bbNum,
        tinggi_badan_cm: tbNum,
        lingkar_kepala_cm: lkNum,
      });
      setHasil(result);
      setPesanSukses('Pengukuran berhasil disimpan & kurva z-score WHO LMS telah diperbarui.');
    } catch (err: any) {
      setErrorPesan(err?.response?.data?.message || 'Gagal menyimpan pengukuran antropometri.');
    } finally {
      setSaving(false);
    }
  }

  function handleResetForm() {
    setBb('');
    setTb('');
    setLk('');
    setPesanSukses(null);
    setErrorPesan(null);
  }

  // Interpretasi WHO
  function getBBUInterpretasi(z?: number) {
    if (z === undefined || z === null) return '-';
    if (z < -3) return 'BB Sangat Kurang (Severely Underweight)';
    if (z < -2) return 'BB Kurang (Underweight)';
    if (z > 2) return 'Risiko BB Lebih';
    return 'BB Normal (Sesuai Usia)';
  }

  function getTBUInterpretasi(z?: number) {
    if (z === undefined || z === null) return '-';
    if (z < -3) return 'Sangat Pendek (Severely Stunted)';
    if (z < -2) return 'Pendek (Stunted)';
    if (z > 3) return 'Tinggi';
    return 'Normal (Bebas Stunting)';
  }

  function getLKUInterpretasi(z?: number) {
    if (z === undefined || z === null) return '-';
    if (z < -2) return 'Mikrosefali (Perlu Evaluasi Neurologis)';
    if (z > 2) return 'Makrosefali';
    return 'Normosefali (Normal)';
  }

  return (
    <div className="space-y-4">
      {/* Header Utama */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 print:hidden">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-ink">
            <Activity className="text-teal" size={24} />
            Antropometri &amp; Kurva Pertumbuhan WHO LMS
          </h2>
          <p className="text-slate text-[13.5px] max-w-2xl">
            Input pengukuran balita (BB, TB, LK), hitung otomatis Z-Score presisi WHO Child Growth Standards, visualisasi kurva KMS digital, dan cetak lembar evaluasi klinis.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={() => window.print()}
            disabled={!hasil}
            className="flex items-center gap-1.5 bg-teal hover:bg-teal-dark disabled:opacity-40 text-white text-xs font-semibold rounded-lg px-3.5 py-2 transition shadow-xs"
          >
            <Printer size={15} /> Cetak Lembar KMS
          </button>
        </div>
      </div>

      {/* Patient Picker Bar (Searchable Combobox) */}
      <div className="bg-white border border-border rounded-xl p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-8 h-8 rounded-lg bg-teal-tint flex items-center justify-center text-teal-dark font-bold text-xs">
            <UserCheck size={18} />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate uppercase tracking-wider">Pasien Aktif:</div>
            <div className="flex items-center gap-2 font-bold text-sm text-ink">
              {selectedKunjungan ? (
                <>
                  <span className="font-mono bg-navy-deep text-white px-1.5 py-0.2 rounded text-xs">
                    {selectedKunjungan.no_antrian}
                  </span>
                  <span>{selectedKunjungan.pasien?.nama}</span>
                  <span className="font-mono text-slate text-xs font-normal">
                    ({selectedKunjungan.pasien?.no_rm})
                  </span>
                  <span
                    className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${
                      currentGender === 'Laki-laki' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                    }`}
                  >
                    {currentGender}
                  </span>
                </>
              ) : (
                <span className="text-xs text-slate italic font-normal">Belum ada pasien yang dipilih dari antrian hari ini</span>
              )}
            </div>
          </div>
        </div>

        {/* Search Box with Autocomplete Dropdown */}
        <div className="relative w-full md:w-80" ref={searchContainerRef}>
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              placeholder="Cari No. Antrian / Nama Pasien…"
              className="w-full pl-8 pr-8 py-1.5 text-xs border border-border rounded-lg bg-bg focus:bg-white focus:outline-none focus:border-teal transition-all"
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
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="absolute right-2 text-slate-400 hover:text-ink p-0.5"
              >
                <ChevronDown size={14} />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && (
            <div className="absolute left-0 right-0 mt-1.5 bg-white border border-border rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto divide-y divide-border animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="p-2 bg-slate-50 text-[10.5px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber-500" />
                {searchQuery ? `Hasil (${filteredKunjungan.length})` : 'Antrian Pasien Hari Ini'}
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
                        setIsSearchOpen(false);
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
                      <span className="text-[10px] uppercase font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">
                        {k.status_antrian}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout: Inputs & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 print:hidden">
        {/* Left Column: Form Pengukuran Ergonomis & Nyaman (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-border rounded-2xl p-5 md:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-tint flex items-center justify-center text-teal-dark">
                  <Scale size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-[15.5px] text-ink">Form Pengukuran Fisik Balita</h3>
                  <p className="text-[11.5px] text-slate">Input data akurat untuk evaluasi kurva WHO</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleResetForm}
                className="text-xs text-slate-600 hover:text-ink px-2.5 py-1 rounded-lg border border-border hover:bg-slate-50 flex items-center gap-1 transition"
              >
                <RotateCcw size={13} /> Reset
              </button>
            </div>

            {pesanSukses && (
              <div className="flex items-center gap-2.5 bg-teal-tint border border-teal text-teal-dark text-[12.5px] rounded-xl p-3 mb-4 animate-in fade-in">
                <CheckCircle2 size={17} className="shrink-0" />
                <span className="font-medium">{pesanSukses}</span>
              </div>
            )}

            {errorPesan && (
              <div className="flex items-center gap-2.5 bg-red-50 border border-status-red text-status-red text-[12.5px] rounded-xl p-3 mb-4">
                <AlertTriangle size={17} className="shrink-0" />
                <span className="font-medium">{errorPesan}</span>
              </div>
            )}

            {/* Gender Switcher (Quick Toggle) */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-ink mb-1.5">Standar Deviasi Rujukan WHO:</label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setManualGender('Laki-laki')}
                  className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-2 ${
                    currentGender === 'Laki-laki'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-border hover:bg-slate-100'
                  }`}
                >
                  ♂ Laki-Laki (Blue Standard)
                </button>
                <button
                  type="button"
                  onClick={() => setManualGender('Perempuan')}
                  className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-2 ${
                    currentGender === 'Perempuan'
                      ? 'bg-pink-600 text-white border-pink-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-border hover:bg-slate-100'
                  }`}
                >
                  ♀ Perempuan (Pink Standard)
                </button>
              </div>
            </div>

            {/* Input Usia Pasien */}
            <div className="mb-4.5 bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <Calendar size={15} className="text-slate-500" />
                  Usia Saat Pemeriksaan:
                </label>
                <span className="text-xs font-mono font-bold text-teal-dark bg-teal-tint px-2 py-0.5 rounded-md">
                  {Math.floor(usiaBulan / 12)} thn {usiaBulan % 12} bln
                </span>
              </div>

              <div className="flex items-center gap-2.5 mb-2.5">
                <button
                  type="button"
                  onClick={() => setUsiaBulan((prev) => Math.max(0, prev - 1))}
                  className="w-11 h-11 rounded-xl bg-white border-2 border-slate-200 hover:bg-slate-100 font-black text-lg text-ink flex items-center justify-center shrink-0 shadow-2xs transition active:scale-95"
                  title="Kurang 1 Bulan"
                >
                  -
                </button>
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={usiaBulan}
                    onChange={(e) => setUsiaBulan(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full h-11 border-2 border-slate-200 focus:border-teal rounded-xl px-4 py-2 text-base font-extrabold text-ink pr-14 text-center focus:outline-none transition bg-white"
                  />
                  <span className="absolute right-3.5 top-3 text-xs text-slate-500 font-bold">Bulan</span>
                </div>
                <button
                  type="button"
                  onClick={() => setUsiaBulan((prev) => Math.min(60, prev + 1))}
                  className="w-11 h-11 rounded-xl bg-white border-2 border-slate-200 hover:bg-slate-100 font-black text-lg text-ink flex items-center justify-center shrink-0 shadow-2xs transition active:scale-95"
                  title="Tambah 1 Bulan"
                >
                  +
                </button>
              </div>

              {/* Quick Age Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10.5px] font-semibold text-slate-500 mr-1">Preset:</span>
                {[0, 6, 12, 18, 24, 36, 48].map((age) => (
                  <button
                    key={age}
                    type="button"
                    onClick={() => setUsiaBulan(age)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                      usiaBulan === age
                        ? 'bg-navy-deep text-white border-navy-deep font-bold shadow-xs'
                        : 'bg-white text-slate-700 border-border hover:bg-slate-100'
                    }`}
                  >
                    {age === 0 ? '0 (Lahir)' : `${age} bln`}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Pengukuran: BB, TB, LK */}
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Berat Badan */}
                <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                      <Scale size={15} className="text-teal" /> Berat Badan (BB)
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.05"
                      value={bb}
                      onChange={(e) => setBb(e.target.value)}
                      placeholder="misal: 10.2"
                      className="w-full bg-white border-2 border-slate-200 focus:border-teal rounded-xl pl-3.5 pr-14 py-2.5 text-base font-extrabold text-ink focus:outline-none transition shadow-2xs"
                    />
                    <span className="absolute right-2.5 top-2.5 text-xs font-bold text-teal-dark bg-teal-tint border border-teal/20 px-2 py-0.5 rounded-md">
                      kg
                    </span>
                  </div>
                  <div className="text-[10.5px] text-slate-500 mt-1">Tanpa jaket/popok tebal</div>
                </div>

                {/* Panjang / Tinggi Badan */}
                <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                      <Ruler size={15} className="text-indigo-500" /> Tinggi/Panjang (TB)
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={tb}
                      onChange={(e) => setTb(e.target.value)}
                      placeholder="misal: 79.5"
                      className="w-full bg-white border-2 border-slate-200 focus:border-teal rounded-xl pl-3.5 pr-14 py-2.5 text-base font-extrabold text-ink focus:outline-none transition shadow-2xs"
                    />
                    <span className="absolute right-2.5 top-2.5 text-xs font-bold text-teal-dark bg-teal-tint border border-teal/20 px-2 py-0.5 rounded-md">
                      cm
                    </span>
                  </div>
                  <div className="text-[10.5px] text-slate-500 mt-1">&lt;2 thn tidur, &ge;2 thn berdiri</div>
                </div>
              </div>

              {/* Lingkar Kepala (LK) */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                    <BrainCircuit size={15} className="text-pink-500" /> Lingkar Kepala (LK)
                  </label>
                  <span className="text-[10.5px] text-slate-500 font-mono">Skrining Neurologis</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={lk}
                    onChange={(e) => setLk(e.target.value)}
                    placeholder="misal: 45.8"
                    className="w-full bg-white border-2 border-slate-200 focus:border-teal rounded-xl pl-3.5 pr-14 py-2.5 text-base font-extrabold text-ink focus:outline-none transition shadow-2xs"
                  />
                  <span className="absolute right-2.5 top-2.5 text-xs font-bold text-teal-dark bg-teal-tint border border-teal/20 px-2 py-0.5 rounded-md">
                    cm
                  </span>
                </div>
                <div className="text-[10.5px] text-slate-500 mt-1">Pita ukur non-elastis melingkari dahi &amp; oksiput</div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSimpan}
            disabled={saving}
            className="mt-6 w-full bg-navy-deep hover:bg-navy-mid text-white text-[13.5px] font-bold rounded-xl py-3.5 px-4 flex items-center justify-center gap-2.5 shadow-md transition disabled:opacity-60 active:scale-[0.99]"
          >
            <Sparkles size={17} className="text-amber-400" />
            {saving ? 'Menghitung Z-Score di Backend…' : '⚡ Hitung & Simpan WHO Z-Score'}
          </button>
        </div>

        {/* Right Column: Z-Score Metric Cards & Spectrum (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          <div className="bg-white border border-border rounded-2xl p-5 md:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3.5 border-b border-border pb-2.5">
              <div className="flex items-center gap-1.5">
                <Award size={17} className="text-amber-500" />
                <h3 className="font-bold text-[14px] text-ink">Hasil Evaluasi WHO LMS (Real-Time)</h3>
              </div>
              <span className="text-[11px] font-mono text-slate">Kemenkes RI 2020 / WHO</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <MetricCard
                title="BB / U (Berat menurut Usia)"
                value={`${bb || '-'} kg`}
                zScore={hasil?.z_score_bb_u}
                status={getBBUInterpretasi(hasil?.z_score_bb_u)}
                icon={<Scale size={14} className="text-teal" />}
              />
              <MetricCard
                title="TB / U (Stunting / Perawakan)"
                value={`${tb || '-'} cm`}
                zScore={hasil?.z_score_tb_u}
                status={getTBUInterpretasi(hasil?.z_score_tb_u)}
                icon={<Ruler size={14} className="text-indigo-500" />}
              />
              <MetricCard
                title="BB / TB (Status Gizi Akut / Wasting)"
                value={hasil?.z_score_bb_tb !== undefined ? `${hasil.z_score_bb_tb} SD` : '-'}
                zScore={hasil?.z_score_bb_tb}
                status={hasil?.interpretasi ?? 'Menunggu hitungan'}
                icon={<Activity size={14} className="text-emerald-500" />}
              />
              <MetricCard
                title="LK / U (Pertumbuhan Otak / LK)"
                value={lk ? `${lk} cm` : '-'}
                zScore={hasil?.z_score_lk_u}
                status={getLKUInterpretasi(hasil?.z_score_lk_u)}
                icon={<BrainCircuit size={14} className="text-pink-500" />}
              />
            </div>

            {/* Kesimpulan Status & Panduan Tindak Lanjut */}
            {hasil && (
              <div className="mt-3.5 bg-slate-50 border border-border rounded-xl p-3 text-xs flex items-start gap-2.5">
                <CheckCircle2 size={17} className="text-teal shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-ink">Kesimpulan Klinis:</div>
                  <div className="text-teal-dark font-semibold text-[13px]">{hasil.interpretasi}</div>
                  <div className="text-slate-600 mt-1 leading-relaxed text-[11.5px]">
                    {hasil.z_score_tb_u !== undefined && hasil.z_score_tb_u < -2
                      ? '⚠️ Terdeteksi indikasi perawakan pendek (Stunting). Rekomendasikan konseling MP-ASI padat gizi, suplementasi Zinc/Zat Besi, dan pemantauan berat berkala.'
                      : '✅ Pertumbuhan anak berada dalam batas standar WHO. Lanjutkan pola asuh gizi seimbang, ASI eksklusif / MP-ASI sesuai tahapan usia.'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Guide Card */}
          <div className="bg-teal-tint/30 border border-teal/20 rounded-xl p-3 text-[11.5px] text-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet size={15} className="text-teal" />
              <span>Standar Deviasi (SD): <b>-2 s/d +2 SD</b> adalah batas normal pertumbuhan anak sehat.</span>
            </div>
            <span className="font-mono text-[10.5px] text-teal-dark font-semibold">Formula Box-Cox LMS</span>
          </div>
        </div>
      </div>

      {/* Visual WHO Growth Curve (Digital KMS) */}
      <div className="print:hidden">
        <WhoGrowthChart
          gender={currentGender}
          usiaBulan={usiaBulan}
          beratBadanKg={parseFloat(bb) || 0}
          tinggiBadanCm={parseFloat(tb) || 0}
          lingkarKepalaCm={parseFloat(lk) || undefined}
          zScores={{
            bb_u: hasil?.z_score_bb_u,
            tb_u: hasil?.z_score_tb_u,
            bb_tb: hasil?.z_score_bb_tb,
            lk_u: hasil?.z_score_lk_u,
          }}
        />
      </div>

      {/* Print View Sheet (Hanya muncul saat Cetak / Print Lembar KMS) */}
      <div className="hidden print:block p-8 border border-slate-300 rounded-xl">
        <div className="border-b-2 border-slate-900 pb-3 mb-4 flex justify-between items-end">
          <div>
            <h1 className="text-xl font-bold text-slate-900">LEMBAR EVALUASI TUMBUH KEMBANG BALITA</h1>
            <p className="text-xs text-slate-600">Puskesmas / Klinik Pratama MedikaScale · Standar WHO LMS &amp; Kemenkes RI</p>
          </div>
          <div className="text-right text-xs">
            <div>Tanggal: <b>{new Date().toLocaleDateString('id-ID')}</b></div>
            <div>No. Antrian: <b>{selectedKunjungan?.no_antrian}</b></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs mb-4">
          <div>
            <p><b>Nama Pasien:</b> {selectedKunjungan?.pasien?.nama}</p>
            <p><b>No. Rekam Medis:</b> {selectedKunjungan?.pasien?.no_rm}</p>
            <p><b>Jenis Kelamin:</b> {currentGender}</p>
          </div>
          <div>
            <p><b>Usia Pemeriksaan:</b> {usiaBulan} Bulan</p>
            <p><b>Layanan Poliklinik:</b> {selectedKunjungan?.layanan?.nama}</p>
            <p><b>Pemeriksa:</b> Tim Medis Poli Anak</p>
          </div>
        </div>

        <table className="w-full border-collapse border border-slate-300 text-xs mb-4">
          <thead>
            <tr className="bg-slate-100 text-left">
              <th className="border border-slate-300 p-2">Parameter</th>
              <th className="border border-slate-300 p-2">Hasil Ukur</th>
              <th className="border border-slate-300 p-2">Z-Score (SD)</th>
              <th className="border border-slate-300 p-2">Klasifikasi WHO / Kemenkes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-300 p-2 font-semibold">Berat Badan menurut Umur (BB/U)</td>
              <td className="border border-slate-300 p-2">{bb} kg</td>
              <td className="border border-slate-300 p-2 font-mono">{hasil?.z_score_bb_u ?? '-'} SD</td>
              <td className="border border-slate-300 p-2">{getBBUInterpretasi(hasil?.z_score_bb_u)}</td>
            </tr>
            <tr>
              <td className="border border-slate-300 p-2 font-semibold">Panjang/Tinggi menurut Umur (TB/U)</td>
              <td className="border border-slate-300 p-2">{tb} cm</td>
              <td className="border border-slate-300 p-2 font-mono">{hasil?.z_score_tb_u ?? '-'} SD</td>
              <td className="border border-slate-300 p-2">{getTBUInterpretasi(hasil?.z_score_tb_u)}</td>
            </tr>
            <tr>
              <td className="border border-slate-300 p-2 font-semibold">Berat menurut Panjang/Tinggi (BB/TB)</td>
              <td className="border border-slate-300 p-2">-</td>
              <td className="border border-slate-300 p-2 font-mono">{hasil?.z_score_bb_tb ?? '-'} SD</td>
              <td className="border border-slate-300 p-2">{hasil?.interpretasi ?? '-'}</td>
            </tr>
            <tr>
              <td className="border border-slate-300 p-2 font-semibold">Lingkar Kepala menurut Umur (LK/U)</td>
              <td className="border border-slate-300 p-2">{lk ? `${lk} cm` : '-'}</td>
              <td className="border border-slate-300 p-2 font-mono">{hasil?.z_score_lk_u ?? '-'} SD</td>
              <td className="border border-slate-300 p-2">{getLKUInterpretasi(hasil?.z_score_lk_u)}</td>
            </tr>
          </tbody>
        </table>

        <div className="border border-slate-300 p-3 rounded text-xs mb-6">
          <p className="font-bold mb-1">Kesimpulan &amp; Saran:</p>
          <p className="leading-relaxed">{hasil?.interpretasi ?? 'Data belum dihitung.'}</p>
        </div>

        <div className="flex justify-between items-center text-xs mt-12 px-6">
          <div className="text-center">
            <p>Orang Tua / Wali Pasien,</p>
            <div className="h-16" />
            <p className="font-semibold">( ........................................ )</p>
          </div>
          <div className="text-center">
            <p>Petugas Pemeriksa / Bidan / Perawat,</p>
            <div className="h-16" />
            <p className="font-semibold">( ........................................ )</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Subcomponent: Metric Card with Z-score Spectrum Needle
function MetricCard({
  title,
  value,
  zScore,
  status,
  icon,
}: {
  title: string;
  value: string;
  zScore?: number;
  status: string;
  icon: React.ReactNode;
}) {
  const isAlert = zScore !== undefined && (zScore < -2 || zScore > 2);
  const isDanger = zScore !== undefined && (zScore < -3 || zScore > 3);

  // Position on spectrum bar (scale from -4 SD to +4 SD)
  const markerPercent =
    zScore !== undefined
      ? Math.min(Math.max(((zScore + 4) / 8) * 100, 5), 95)
      : 50;

  return (
    <div
      className={`border rounded-xl p-4 transition-all flex flex-col justify-between ${
        isDanger
          ? 'border-red-300 bg-red-50/50'
          : isAlert
          ? 'border-amber-300 bg-amber-50/50'
          : 'border-border bg-slate-50/60'
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-slate flex items-center gap-1.5">
            {icon}
            {title}
          </span>
          {zScore !== undefined && (
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-border shadow-2xs">
              {zScore > 0 ? `+${zScore}` : zScore} SD
            </span>
          )}
        </div>

        <div className="text-xl font-black text-ink my-1 tracking-tight">{value}</div>
        <div
          className={`text-[12.5px] font-bold leading-snug ${
            isDanger ? 'text-red-700' : isAlert ? 'text-amber-700' : 'text-teal-dark'
          }`}
        >
          {status}
        </div>
      </div>

      {/* Mini Visual Spectrum Gauge */}
      <div className="mt-3.5 pt-2.5 border-t border-slate-200/80">
        <div className="relative h-2.5 rounded-full overflow-hidden flex shadow-inner">
          <div className="w-[12.5%] bg-red-400" title="< -3 SD" />
          <div className="w-[12.5%] bg-amber-300" title="-3 s/d -2 SD" />
          <div className="w-[50%] bg-emerald-400" title="-2 s/d +2 SD (Normal)" />
          <div className="w-[12.5%] bg-amber-300" title="+2 s/d +3 SD" />
          <div className="w-[12.5%] bg-red-400" title="> +3 SD" />
        </div>

        {/* Marker Needle */}
        {zScore !== undefined && (
          <div className="relative h-2 mt-0.5">
            <div
              className="absolute -top-1.5 transform -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-slate-900 border-2 border-white shadow-sm"
              style={{ left: `${markerPercent}%` }}
            />
          </div>
        )}

        <div className="flex justify-between text-[9.5px] text-slate-400 font-mono mt-1">
          <span>-3</span>
          <span>-2</span>
          <span className="font-bold text-slate-700">0 (Med)</span>
          <span>+2</span>
          <span>+3</span>
        </div>
      </div>
    </div>
  );
}
