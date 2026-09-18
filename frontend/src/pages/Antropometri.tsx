import { useState } from 'react';
import { Printer } from 'lucide-react';
import { simpanAntropometri } from '@/api/klinis';
import type { AntropometriPengukuran } from '@/types';

const KUNJUNGAN_DEMO_ID = 103;
const PASIEN_DEMO_ID = 3;

export default function Antropometri() {
  const [bb, setBb] = useState('10.2');
  const [tb, setTb] = useState('79.5');
  const [lk, setLk] = useState('45.8');
  const [hasil, setHasil] = useState<AntropometriPengukuran | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSimpan() {
    setSaving(true);
    try {
      const result = await simpanAntropometri({
        kunjungan_id: KUNJUNGAN_DEMO_ID,
        pasien_id: PASIEN_DEMO_ID,
        usia_bulan: 18,
        berat_badan_kg: parseFloat(bb) || 0,
        tinggi_badan_cm: parseFloat(tb) || 0,
        lingkar_kepala_cm: parseFloat(lk) || 0,
      });
      setHasil(result);
    } finally {
      setSaving(false);
    }
  }

  function handleCetak() {
    window.print();
  }

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold mb-1">Antropometri &amp; kurva pertumbuhan (WHO)</h2>
          <p className="text-slate text-[13.5px] max-w-xl">
            Input pengukuran, lihat interpretasi otomatis dari backend, lalu cetak untuk rekam medis fisik bila diperlukan.
          </p>
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl">
        <div className="px-4.5 py-3.5 border-b border-border flex items-center justify-between print:hidden">
          <h3 className="font-bold text-[14.5px]">An. Bilqis Nur Aisyah · RM-2024-018472 · 18 bulan</h3>
          <button
            onClick={handleCetak}
            disabled={!hasil}
            className="flex items-center gap-2 bg-teal hover:bg-teal-dark disabled:opacity-40 text-white text-[12.5px] font-semibold rounded-lg px-3.5 py-2"
          >
            <Printer size={15} /> Cetak
          </button>
        </div>

        <div className="p-4.5 print:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <Field label="Berat badan (kg)" value={bb} onChange={setBb} />
            <Field label="Tinggi/panjang badan (cm)" value={tb} onChange={setTb} />
            <Field label="Lingkar kepala (cm)" value={lk} onChange={setLk} />
          </div>

          <button
            onClick={handleSimpan}
            disabled={saving}
            className="mt-4 bg-navy-deep hover:bg-navy-mid text-white text-[13px] font-semibold rounded-lg px-4 py-2.5 disabled:opacity-60"
          >
            {saving ? 'Menghitung…' : 'Hitung & simpan'}
          </button>

          {hasil && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              <ResultCard label="BB/U" value={`${hasil.berat_badan_kg} kg`} interpretasi="Berat badan normal" />
              <ResultCard label="TB/U" value={`${hasil.tinggi_badan_cm} cm`} interpretasi="Tidak stunting" />
              <ResultCard label="LK/U" value={`${hasil.lingkar_kepala_cm} cm`} interpretasi="Normosefali" />
              <ResultCard
                label="Interpretasi"
                value={hasil.z_score_bb_tb?.toString() ?? '-'}
                interpretasi={hasil.interpretasi ?? '-'}
              />
            </div>
          )}

          <p className="text-[11px] text-slate mt-4 leading-relaxed">
            Catatan implementasi: perhitungan z-score di atas untuk mode demo saja. Backend NestJS harus
            menghitung ulang memakai tabel standar WHO (metode LMS) — lihat fungsi{' '}
            <code>simpanAntropometri</code> di <code>src/api/klinis.ts</code>.
          </p>
        </div>

        {/* Area cetak: hanya tampil saat window.print() dipanggil */}
        <div className="hidden print:block p-8">
          <h2 className="text-lg font-bold mb-2">Antropometri — An. Bilqis Nur Aisyah (RM-2024-018472)</h2>
          <p className="text-sm">
            BB: {bb} kg · TB: {tb} cm · LK: {lk} cm — {hasil?.interpretasi ?? 'Belum dihitung'}
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-slate mb-1.5">{label}</label>
      <input
        type="number"
        step="0.1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-border rounded-lg px-3 py-2 text-[13.5px]"
      />
    </div>
  );
}

function ResultCard({ label, value, interpretasi }: { label: string; value: string; interpretasi: string }) {
  return (
    <div className="border border-border rounded-xl p-3.5 bg-status-greenTint">
      <div className="text-[11.5px] text-slate">{label}</div>
      <div className="text-lg font-extrabold my-0.5">{value}</div>
      <div className="text-[11px] text-status-green font-semibold">{interpretasi}</div>
    </div>
  );
}
