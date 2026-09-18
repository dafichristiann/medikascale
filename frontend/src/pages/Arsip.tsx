import { useEffect, useState } from 'react';
import { Search, Truck, CheckCircle2 } from 'lucide-react';
import { cariArsip, fetchTrackingDokumen, mintaPengirimanDokumen } from '@/api/arsip';
import Chip from '@/components/Chip';
import type { ArsipLokasi, ArsipTrackingStep } from '@/types';

export default function Arsip() {
  const [query, setQuery] = useState('');
  const [hasil, setHasil] = useState<ArsipLokasi[]>([]);
  const [dipilih, setDipilih] = useState<ArsipLokasi | null>(null);
  const [tracking, setTracking] = useState<ArsipTrackingStep[]>([]);
  const [loadingKirim, setLoadingKirim] = useState(false);
  const [notif, setNotif] = useState<string | null>(null);

  async function handleCari(e?: React.FormEvent) {
    e?.preventDefault();
    const data = await cariArsip(query);
    setHasil(data);
    setDipilih(data[0] ?? null);
    setNotif(null);
  }

  async function handleMintaPengiriman() {
    if (!dipilih) return;
    setLoadingKirim(true);
    setNotif(null);
    try {
      await mintaPengirimanDokumen(dipilih.pasien_id, 'Poli Anak Lt.3');
      setNotif(`Permintaan pengiriman berkas ${dipilih.nama_pasien} ke Poli Anak Lt.3 berhasil dikirim ke kurir.`);
      const updated = await fetchTrackingDokumen(dipilih.pasien_id);
      setTracking(updated);
    } catch (err) {
      setNotif('Gagal memproses permintaan pengiriman berkas.');
    } finally {
      setLoadingKirim(false);
    }
  }

  useEffect(() => {
    handleCari();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (dipilih) fetchTrackingDokumen(dipilih.pasien_id).then(setTracking);
  }, [dipilih]);

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-1">Arsip rekam medis</h2>
        <p className="text-slate text-[13.5px] max-w-xl">
          Cari lokasi berkas fisik sampai level rak &amp; kotak, dan lacak pengiriman dokumen antar lantai tanpa ember.
        </p>
      </div>

      <form onSubmit={handleCari} className="flex gap-2.5 mb-5">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari nama pasien atau No. RM…"
          className="flex-1 border border-border rounded-lg px-3.5 py-2.5 text-[13.5px]"
        />
        <button type="submit" className="bg-teal hover:bg-teal-dark text-white rounded-lg px-4 flex items-center gap-2 text-sm font-semibold">
          <Search size={16} /> Cari
        </button>
      </form>

      <div className="grid md:grid-cols-2 gap-4 items-start">
        <div className="bg-white border border-border rounded-xl">
          <div className="px-4 py-3.5 border-b border-border flex justify-between">
            <h3 className="font-bold text-[14.5px]">Hasil pencarian</h3>
            <span className="text-[12px] text-slate">{hasil.length} berkas ditemukan</span>
          </div>
          <div className="p-2">
            {hasil.map((a) => (
              <button
                key={a.pasien_id}
                onClick={() => setDipilih(a)}
                className={`w-full text-left p-3 rounded-lg text-[13px] mb-1 ${
                  dipilih?.pasien_id === a.pasien_id ? 'bg-teal-tint' : 'hover:bg-bg'
                }`}
              >
                <div className="font-semibold">{a.nama_pasien}</div>
                <div className="text-[12px] text-slate font-mono">{a.no_rm}</div>
                <div className="text-[12px] text-slate">
                  {a.lantai} · {a.ruang} · {a.rak} · {a.kotak}
                </div>
                <div className="mt-1">
                  <Chip tone={a.status === 'tersedia' ? 'green' : a.status === 'dipinjam' ? 'amber' : 'grey'}>
                    {a.status === 'tersedia' ? 'Tersedia' : a.status === 'dipinjam' ? 'Dipinjam' : 'Dalam pengiriman'}
                  </Chip>
                </div>
              </button>
            ))}
            {hasil.length === 0 && <p className="text-[13px] text-slate p-3">Tidak ditemukan.</p>}
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl">
          <div className="px-4 py-3.5 border-b border-border">
            <h3 className="font-bold text-[14.5px]">Pelacakan pengiriman dokumen</h3>
          </div>
          <div className="p-4">
            {!dipilih ? (
              <p className="text-[13px] text-slate">Pilih berkas untuk melihat status pengiriman.</p>
            ) : (
              <>
                <div className="flex items-center gap-2 text-[12.5px] text-slate mb-4 flex-wrap">
                  <b className="text-ink">{dipilih.lantai}</b>›<b className="text-ink">{dipilih.ruang}</b>›
                  <b className="text-ink">{dipilih.rak}</b>›<b className="text-ink">{dipilih.baris}</b>›
                  <b className="text-ink">{dipilih.kotak}</b>
                </div>
                <div className="flex flex-col">
                  {tracking.map((t, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span
                          className={`w-2.5 h-2.5 rounded-full mt-1 ${
                            t.selesai ? 'bg-status-green' : t.aktif ? 'bg-teal ring-4 ring-teal-tint' : 'bg-border'
                          }`}
                        />
                        {i < tracking.length - 1 && <span className="w-0.5 flex-1 bg-border min-h-[26px]" />}
                      </div>
                      <div className="pb-5">
                        <b className="text-[13px] block">{t.label}</b>
                        <span className="text-[12px] text-slate">
                          {t.keterangan} {t.waktu && `· ${t.waktu}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {notif && (
                  <div className="flex items-center gap-2 bg-teal-tint border border-teal text-teal-dark text-[12.5px] rounded-lg p-2.5 my-3">
                    <CheckCircle2 size={16} className="shrink-0" />
                    <span>{notif}</span>
                  </div>
                )}
                <button
                  onClick={handleMintaPengiriman}
                  disabled={loadingKirim}
                  className="flex items-center gap-2 text-[12.5px] font-semibold bg-teal hover:bg-teal-dark text-white rounded-lg px-3.5 py-2 mt-2 disabled:opacity-60 transition"
                >
                  <Truck size={15} /> {loadingKirim ? 'Mengirim permintaan…' : 'Minta pengiriman dokumen ke Poli Anak'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
