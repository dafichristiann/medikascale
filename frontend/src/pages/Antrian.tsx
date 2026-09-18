import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  Ruler,
  Stethoscope,
  Plus,
  Trash2,
  CheckCircle2,
  X,
  FileText,
  Activity,
  Send,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  fetchAntrianHariIni,
  ubahStatusAntrian,
  prioritaskanAntrian,
  urutkanAntrian,
  URUTAN_STATUS,
} from '@/api/antrian';
import { fetchDetailKunjungan, simpanPemeriksaanDokter } from '@/api/klinis';
import type {
  Kunjungan,
  StatusAntrian,
  DetailKunjungan360,
  ResepItemInput,
  LabRequestInput,
} from '@/types';

const META: Record<StatusAntrian, { label: string; dot: string }> = {
  putih: { label: 'Terdaftar', dot: 'bg-slate-400' },
  hijau: { label: 'Ditimbang', dot: 'bg-status-green' },
  kuning: { label: 'Diperiksa', dot: 'bg-status-amber' },
  merah: { label: 'Dapat resep', dot: 'bg-status-red' },
  selesai: { label: 'Selesai Pelayanan', dot: 'bg-blue-600' },
};

export default function Antrian() {
  const { hasPermission } = useAuth();
  const [items, setItems] = useState<Kunjungan[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorPesan, setErrorPesan] = useState<string | null>(null);

  // State Modal Pemeriksaan Dokter 360
  const [selectedKunjungan, setSelectedKunjungan] = useState<Kunjungan | null>(null);
  const [detail360, setDetail360] = useState<DetailKunjungan360 | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [savingExam, setSavingExam] = useState(false);

  // Form Pemeriksaan State
  const [keluhan, setKeluhan] = useState('');
  const [pemeriksaanFisik, setPemeriksaanFisik] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [catatanTerapi, setCatatanTerapi] = useState('');
  const [resepList, setResepList] = useState<ResepItemInput[]>([]);
  const [labRequests, setLabRequests] = useState<LabRequestInput[]>([]);

  const loadAntrian = () => {
    fetchAntrianHariIni()
      .then(setItems)
      .catch((err) => setErrorPesan(err?.response?.data?.message || 'Gagal memuat daftar antrian.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAntrian();
  }, []);

  async function handlePrioritaskan(id: number) {
    setErrorPesan(null);
    try {
      const updated = await prioritaskanAntrian(id);
      setItems((prev) => prev.map((k) => (k.id === id ? updated : k)));
    } catch (err: any) {
      setErrorPesan(err?.response?.data?.message || 'Gagal menandai prioritas.');
    }
  }

  async function handleLanjut(k: Kunjungan) {
    const idx = URUTAN_STATUS.indexOf(k.status_antrian);
    if (idx >= URUTAN_STATUS.length - 1) return;
    setErrorPesan(null);
    try {
      const updated = await ubahStatusAntrian(k.id, URUTAN_STATUS[idx + 1]);
      setItems((prev) => prev.map((x) => (x.id === k.id ? updated : x)));
    } catch (err: any) {
      setErrorPesan(err?.response?.data?.message || 'Gagal mengubah status antrian.');
    }
  }

  async function handleKembali(k: Kunjungan) {
    const idx = URUTAN_STATUS.indexOf(k.status_antrian);
    if (idx <= 0) return;
    setErrorPesan(null);
    try {
      const targetStatus = URUTAN_STATUS[idx - 1];
      const updated = await ubahStatusAntrian(k.id, targetStatus);
      setItems((prev) => prev.map((x) => (x.id === k.id ? updated : x)));
    } catch (err: any) {
      setErrorPesan(err?.response?.data?.message || 'Gagal mengembalikan status antrian.');
    }
  }

  // Buka Modal 360
  async function handleBukaPemeriksaan(k: Kunjungan) {
    setSelectedKunjungan(k);
    setKeluhan(k.keluhan_utama || '');
    setPemeriksaanFisik('');
    setDiagnosis('');
    setCatatanTerapi('');
    setResepList([]);
    setLabRequests([]);
    setLoadingDetail(true);

    try {
      const data = await fetchDetailKunjungan(k.id);
      setDetail360(data);
      if (data.pemeriksaan) {
        setKeluhan(data.pemeriksaan.keluhan || k.keluhan_utama || '');
        setPemeriksaanFisik(data.pemeriksaan.pemeriksaan_fisik || '');
        setDiagnosis(data.pemeriksaan.diagnosis || '');
        setCatatanTerapi(data.pemeriksaan.catatan_terapi || '');
      }
    } catch {
      // Fallback
    } finally {
      setLoadingDetail(false);
    }
  }

  // Tambah baris resep
  function handleAddResepRow() {
    setResepList((prev) => [
      ...prev,
      { nama_obat: '', dosis: '', kuantitas: 1, aturan_pakai: '' },
    ]);
  }

  function handleRemoveResepRow(index: number) {
    setResepList((prev) => prev.filter((_, idx) => idx !== index));
  }

  function handleResepChange(index: number, field: keyof ResepItemInput, value: any) {
    setResepList((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)),
    );
  }

  // Toggle Permintaan Lab
  function handleToggleLab(jenis: string, tipe: 'lab' | 'radiologi') {
    setLabRequests((prev) => {
      const exists = prev.some((l) => l.jenis_pemeriksaan === jenis);
      if (exists) {
        return prev.filter((l) => l.jenis_pemeriksaan !== jenis);
      } else {
        return [...prev, { tipe, jenis_pemeriksaan: jenis }];
      }
    });
  }

  // Submit Pemeriksaan
  async function handleSubmitPemeriksaan(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedKunjungan) return;
    setSavingExam(true);
    setErrorPesan(null);

    try {
      const validResep = resepList.filter((r) => r.nama_obat.trim() !== '');
      await simpanPemeriksaanDokter({
        kunjungan_id: selectedKunjungan.id,
        keluhan,
        pemeriksaan_fisik: pemeriksaanFisik,
        diagnosis,
        catatan_terapi: catatanTerapi,
        resep_items: validResep.length > 0 ? validResep : undefined,
        lab_requests: labRequests.length > 0 ? labRequests : undefined,
      });

      setSelectedKunjungan(null);
      loadAntrian();
    } catch (err: any) {
      setErrorPesan(err?.response?.data?.message || 'Gagal menyimpan data pemeriksaan.');
    } finally {
      setSavingExam(false);
    }
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

      {errorPesan && (
        <div className="bg-red-50 border border-status-red text-status-red text-[12.5px] rounded-lg p-3 mb-4">
          {errorPesan}
        </div>
      )}

      {loading ? (
        <p className="text-slate text-sm">Memuat antrian…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5">
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
                          {new Date(k.created_at).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="font-semibold text-[13px]">{k.pasien.nama}</div>
                      <div className="text-[11.5px] text-slate">{k.layanan.nama}</div>
                      {k.prioritas && (
                        <div className="flex items-center gap-1 text-[10.5px] font-bold text-status-red mt-1">
                          <Star size={11} fill="currentColor" /> Prioritas
                        </div>
                      )}

                      {/* Shortcut modul klinis */}
                      {status === 'putih' && hasPermission('antropometri.input') && (
                        <Link
                          to={`/antropometri?kunjungan_id=${k.id}`}
                          className="text-[11px] font-semibold text-teal hover:text-teal-dark flex items-center gap-1 mt-1.5"
                        >
                          <Ruler size={12} /> Timbang Antropometri
                        </Link>
                      )}

                      {/* Dokter 360 Examination Trigger */}
                      {hasPermission('resep.kirim') && (
                        <button
                          onClick={() => handleBukaPemeriksaan(k)}
                          className="text-[11px] font-semibold text-teal-dark bg-teal-tint/60 hover:bg-teal-tint px-2 py-1 rounded flex items-center gap-1.5 mt-2 transition-colors w-full justify-center"
                        >
                          <Stethoscope size={13} /> Periksa Pasien (360°)
                        </button>
                      )}

                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {status !== 'putih' && hasPermission('antrian.ubah_status') && (
                          <button
                            onClick={() => handleKembali(k)}
                            title="Kembalikan status antrian ke tahap sebelumnya"
                            className="text-[11.5px] font-semibold border border-slate-300 text-slate-600 rounded-md px-2 py-1 hover:bg-slate-100 hover:text-ink flex items-center gap-1 transition-colors"
                          >
                            <RotateCcw size={11} /> Kembali
                          </button>
                        )}
                        {!k.prioritas && hasPermission('antrian.prioritaskan') && (
                          <button
                            onClick={() => handlePrioritaskan(k.id)}
                            className="text-[11.5px] font-semibold border border-border rounded-md px-2 py-1 hover:border-teal"
                          >
                            Prioritaskan
                          </button>
                        )}
                        {status !== 'selesai' && hasPermission('antrian.ubah_status') && (
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

      {/* Modal Pemeriksaan Dokter 360 */}
      {selectedKunjungan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-border w-full max-w-4xl max-h-[92vh] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="p-4 sm:p-5 border-b border-border bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-tint flex items-center justify-center text-teal-dark">
                  <Stethoscope size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-ink flex items-center gap-2">
                    Pemeriksaan Dokter 360°
                    <span className="text-xs font-mono bg-navy-deep text-white px-2 py-0.5 rounded">
                      {selectedKunjungan.no_antrian}
                    </span>
                  </h3>
                  <p className="text-xs text-slate">
                    Pasien: <b>{selectedKunjungan.pasien.nama}</b> ({selectedKunjungan.pasien.no_rm}) · Poli: {selectedKunjungan.layanan.nama}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedKunjungan(null)}
                className="text-slate hover:text-ink p-1 rounded-lg hover:bg-slate-200/50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitPemeriksaan} className="flex-1 overflow-y-auto p-5 space-y-6">
              {loadingDetail ? (
                <div className="p-8 text-center text-slate text-sm">Memuat rekam medis pasien…</div>
              ) : (
                <>
                  {/* Section: Antropometri & WHO LMS (Perawat) */}
                  <div className="bg-slate-50 border border-border rounded-xl p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                      <Activity size={14} className="text-teal" /> Data Pengukuran Antropometri Terakhir
                    </h4>
                    {detail360?.antropometri ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div className="bg-white p-2.5 rounded-lg border border-border">
                            <span className="text-slate">Berat Badan:</span>
                            <div className="font-bold text-ink text-sm">
                              {detail360.antropometri.berat_badan_kg} kg
                            </div>
                          </div>
                          <div className="bg-white p-2.5 rounded-lg border border-border">
                            <span className="text-slate">Tinggi Badan:</span>
                            <div className="font-bold text-ink text-sm">
                              {detail360.antropometri.tinggi_badan_cm} cm
                            </div>
                          </div>
                          <div className="bg-white p-2.5 rounded-lg border border-border">
                            <span className="text-slate">Lingkar Kepala:</span>
                            <div className="font-bold text-ink text-sm">
                              {detail360.antropometri.lingkar_kepala_cm || '—'} cm
                            </div>
                          </div>
                          <div className="bg-white p-2.5 rounded-lg border border-border">
                            <span className="text-slate">Z-Score BB/U:</span>
                            <div className="font-bold text-ink text-sm">
                              {detail360.antropometri.z_score_bb_u ?? '—'}
                            </div>
                          </div>
                        </div>
                        {detail360.antropometri.interpretasi && (
                          <div className="text-xs bg-teal-tint/40 border border-teal/20 text-teal-dark p-2 rounded-lg font-medium">
                            Interpretasi WHO LMS: {detail360.antropometri.interpretasi}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 italic">
                        Belum ada data antropometri yang dicatat untuk kunjungan ini.
                      </div>
                    )}
                  </div>

                  {/* Section: Pemeriksaan Fisik & Klinis */}
                  <div className="space-y-3.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <FileText size={14} className="text-teal" /> Catatan Pemeriksaan Klinis
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Anamnesis / Keluhan Utama
                        </label>
                        <textarea
                          required
                          rows={2}
                          placeholder="Keluhan pasien saat datang..."
                          value={keluhan}
                          onChange={(e) => setKeluhan(e.target.value)}
                          className="w-full border border-border rounded-lg p-2.5 text-sm focus:outline-none focus:border-teal"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Pemeriksaan Fisik
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Suhu, tanda vital, inspeksi, auskultasi..."
                          value={pemeriksaanFisik}
                          onChange={(e) => setPemeriksaanFisik(e.target.value)}
                          className="w-full border border-border rounded-lg p-2.5 text-sm focus:outline-none focus:border-teal"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Diagnosis Klinis <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: ISPA / Faringitis Akut / Anemia"
                          value={diagnosis}
                          onChange={(e) => setDiagnosis(e.target.value)}
                          className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Catatan Edukasi &amp; Terapi
                        </label>
                        <input
                          type="text"
                          placeholder="Istirahat, kurangi makanan dingin, banyak minum"
                          value={catatanTerapi}
                          onChange={(e) => setCatatanTerapi(e.target.value)}
                          className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section: E-Resep */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                        <Send size={14} className="text-teal" /> E-Resep Farmasi
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddResepRow}
                        className="text-xs font-semibold text-teal hover:text-teal-dark flex items-center gap-1"
                      >
                        <Plus size={14} /> Tambah Obat
                      </button>
                    </div>

                    {resepList.length === 0 ? (
                      <div className="text-xs text-slate-400 border border-dashed border-border rounded-lg p-3 text-center">
                        Tidak ada resep obat. Klik &quot;+ Tambah Obat&quot; jika pasien memerlukan obat.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {resepList.map((row, idx) => (
                          <div
                            key={idx}
                            className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded-lg border border-border"
                          >
                            <div className="col-span-4">
                              <input
                                type="text"
                                placeholder="Nama Obat (cth: Paracetamol Syr)"
                                value={row.nama_obat}
                                onChange={(e) => handleResepChange(idx, 'nama_obat', e.target.value)}
                                className="w-full border border-border rounded-md px-2 py-1 text-xs bg-white focus:outline-none focus:border-teal"
                              />
                            </div>
                            <div className="col-span-3">
                              <input
                                type="text"
                                placeholder="Dosis (cth: 3x1 cth)"
                                value={row.dosis}
                                onChange={(e) => handleResepChange(idx, 'dosis', e.target.value)}
                                className="w-full border border-border rounded-md px-2 py-1 text-xs bg-white focus:outline-none focus:border-teal"
                              />
                            </div>
                            <div className="col-span-2">
                              <input
                                type="number"
                                min={1}
                                placeholder="Jml"
                                value={row.kuantitas}
                                onChange={(e) =>
                                  handleResepChange(idx, 'kuantitas', Number(e.target.value))
                                }
                                className="w-full border border-border rounded-md px-2 py-1 text-xs bg-white focus:outline-none focus:border-teal"
                              />
                            </div>
                            <div className="col-span-2">
                              <input
                                type="text"
                                placeholder="Aturan (cth: sesudah makan)"
                                value={row.aturan_pakai}
                                onChange={(e) => handleResepChange(idx, 'aturan_pakai', e.target.value)}
                                className="w-full border border-border rounded-md px-2 py-1 text-xs bg-white focus:outline-none focus:border-teal"
                              />
                            </div>
                            <div className="col-span-1 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveResepRow(idx)}
                                className="text-slate-400 hover:text-red-500"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Section: Permintaan Penunjang (Lab / Radiologi) */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Permintaan Pemeriksaan Penunjang (Opsional)
                    </h4>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {[
                        { label: 'Darah Lengkap (Hematologi)', tipe: 'lab' as const },
                        { label: 'Urin Lengkap', tipe: 'lab' as const },
                        { label: 'Rontgen Thorax AP/PA', tipe: 'radiologi' as const },
                        { label: 'USG Abdomen', tipe: 'radiologi' as const },
                      ].map((p, idx) => {
                        const isSelected = labRequests.some(
                          (l) => l.jenis_pemeriksaan === p.label,
                        );
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleToggleLab(p.label, p.tipe)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                              isSelected
                                ? 'bg-teal-tint text-teal-dark border-teal font-semibold'
                                : 'bg-white text-slate-700 border-border hover:border-slate-300'
                            }`}
                          >
                            + {p.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Footer Modal */}
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <div className="text-xs text-slate">
                  {resepList.length > 0 ? (
                    <span className="text-amber-700 font-medium">
                      Status kunjungan akan otomatis beralih ke <b>Merah (Dapat Resep)</b>
                    </span>
                  ) : (
                    <span className="text-slate-600">
                      Status kunjungan akan beralih ke <b>Kuning (Diperiksa)</b>
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedKunjungan(null)}
                    className="px-4 py-2 border border-border rounded-lg text-sm text-slate hover:bg-slate-50 font-medium"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={savingExam || loadingDetail}
                    className="px-4 py-2 bg-teal hover:bg-teal-dark text-white rounded-lg text-sm font-semibold shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 size={16} />{' '}
                    {savingExam ? 'Menyimpan…' : 'Simpan Pemeriksaan'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
