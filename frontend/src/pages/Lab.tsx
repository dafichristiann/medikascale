import { useEffect, useState } from 'react';
import { fetchPermintaanLab, ubahStatusLab } from '@/api/klinis';
import Chip from '@/components/Chip';
import type { PermintaanLab } from '@/types';

export default function Lab() {
  const [items, setItems] = useState<PermintaanLab[]>([]);

  useEffect(() => {
    fetchPermintaanLab().then(setItems);
  }, []);

  async function handleAksi(item: PermintaanLab) {
    const next = item.status === 'menunggu' ? 'diproses' : 'hasil_siap';
    const updated = await ubahStatusLab(item.id, next);
    setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, status: updated.status ?? next } : p)));
  }

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold mb-1">Permintaan lab &amp; radiologi</h2>
        <p className="text-slate text-[13.5px] max-w-xl">
          Permintaan pemeriksaan dari dokter, perbarui status hingga hasil siap diambil.
        </p>
      </div>

      <div className="bg-white border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[11.5px] uppercase text-slate">
              <th className="py-2.5 px-4">No. RM</th>
              <th className="py-2.5 px-4">Pasien</th>
              <th className="py-2.5 px-4">Pemeriksaan</th>
              <th className="py-2.5 px-4">Diminta oleh</th>
              <th className="py-2.5 px-4">Status</th>
              <th className="py-2.5 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-border">
                <td className="py-2.5 px-4 font-mono">{item.pasien.no_rm}</td>
                <td className="py-2.5 px-4">{item.pasien.nama}</td>
                <td className="py-2.5 px-4">{item.pemeriksaan}</td>
                <td className="py-2.5 px-4">{item.diminta_oleh}</td>
                <td className="py-2.5 px-4">
                  <StatusChip status={item.status} />
                </td>
                <td className="py-2.5 px-4">
                  {item.status !== 'hasil_siap' && (
                    <button
                      onClick={() => handleAksi(item)}
                      className="text-[11.5px] font-semibold border border-border rounded-md px-2.5 py-1 hover:border-teal"
                    >
                      {item.status === 'menunggu' ? 'Mulai proses' : 'Input hasil'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: PermintaanLab['status'] }) {
  if (status === 'menunggu') return <Chip tone="grey">Menunggu</Chip>;
  if (status === 'diproses') return <Chip tone="amber">Diproses</Chip>;
  return <Chip tone="green">Hasil siap</Chip>;
}
