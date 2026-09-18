import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchThreadResep, ubahStatusResep } from '@/api/resep';
import Chip from '@/components/Chip';
import type { PesanResep } from '@/types';

const KUNJUNGAN_DEMO_ID = 103; // An. Bilqis Nur Aisyah — dipakai sebagai contoh thread aktif

export default function Resep() {
  const { user, hasPermission } = useAuth();
  const [thread, setThread] = useState<PesanResep[]>([]);

  useEffect(() => {
    fetchThreadResep(KUNJUNGAN_DEMO_ID).then(setThread);
  }, []);

  async function handleUbahStatus(id: number, status: PesanResep['status']) {
    const updated = await ubahStatusResep(id, status);
    setThread((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-1">Pesan resep</h2>
        <p className="text-slate text-[13.5px] max-w-xl">
          Resep terkirim sebagai pesan terstruktur, apoteker menandai status penyiapan secara real-time.
        </p>
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden min-h-[420px] flex flex-col">
        <div className="px-4.5 py-3.5 border-b border-border">
          <b className="text-[13.5px] block">dr. Angga, Sp.A → Apt. Ratna Wijaya</b>
          <span className="text-[11.5px] text-slate">Pasien: An. Bilqis Nur Aisyah · RM-2024-018472</span>
        </div>

        <div className="flex-1 p-4.5 flex flex-col gap-3 overflow-y-auto">
          {thread.map((p) => {
            const isDokter = p.dari_user.startsWith('dr.');
            return (
              <div
                key={p.id}
                className={`max-w-[75%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                  isDokter
                    ? 'bg-navy-deep text-white self-start rounded-bl-sm'
                    : 'bg-teal-tint text-ink self-end rounded-br-sm'
                }`}
              >
                {p.isi_pesan}
                {p.resep_item && (
                  <div className="bg-white/10 border border-white/25 rounded-lg p-2.5 mt-2 text-[12px]">
                    <b>e-Resep</b>
                    <ul className="mt-1 space-y-0.5">
                      {p.resep_item.map((it, i) => (
                        <li key={i}>
                          • {it.nama_obat} — {it.jumlah}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-2">
                  <StatusChip status={p.status} />
                </div>
              </div>
            );
          })}
        </div>

        {hasPermission('resep.proses') && (
          <div className="border-t border-border p-3.5 flex gap-2">
            {(['disiapkan', 'siap_diambil'] as const).map((s) => (
              <button
                key={s}
                onClick={() => handleUbahStatus(thread[thread.length - 1]?.id ?? 0, s)}
                className="text-[12px] font-semibold border border-border rounded-lg px-3 py-1.5 hover:border-teal"
              >
                Tandai: {s === 'disiapkan' ? 'Sedang disiapkan' : 'Siap diambil'}
              </button>
            ))}
          </div>
        )}
        {hasPermission('resep.kirim') && (
          <div className="border-t border-border p-3.5 text-[12px] text-slate">
            Masuk sebagai {user?.nama} — kirim resep baru dari halaman detail kunjungan pasien.
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
