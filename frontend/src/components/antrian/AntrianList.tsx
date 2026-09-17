import { useEffect, useState } from 'react';
import { useAntrianStore } from '../../store/antrianStore';
import { useAuthStore } from '../../store/authStore';
import type { Kunjungan } from '../../types/index';
import { Card, EmptyState, LoadingState, PageHeader, StatusBadge } from '../ui/UI';
import { ClipboardList, RefreshCw } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  putih: 'bg-gray-100 text-gray-800',
  hijau: 'bg-green-100 text-green-800',
  kuning: 'bg-yellow-100 text-yellow-800',
  merah: 'bg-red-100 text-red-800',
};

const STATUS_BG: Record<string, string> = {
  putih: 'bg-gray-50',
  hijau: 'bg-green-50',
  kuning: 'bg-yellow-50',
  merah: 'bg-red-50',
};

export const AntrianList = () => {
  const { antrian, loading, fetchAntrian, updateStatus } = useAntrianStore();
  const { hasPermission } = useAuthStore();
  const [filters, setFilters] = useState({ poli: '', status: '', prioritas: false });

  useEffect(() => {
    fetchAntrian(filters);
  }, [filters]);

  const canEditStatus = hasPermission('antrian.update_status');
  const canPrioritize = hasPermission('antrian.prioritaskan');

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateStatus(id, newStatus);
  };

  const handlePrioritize = async (id: string, item: Kunjungan) => {
    await updateStatus(id, item.status_antrian, !item.prioritas);
  };

  if (loading) {
    return <LoadingState label="Memuat daftar antrean..." />;
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Daftar Antrean" description={`${antrian.length} pasien terdaftar pada antrean aktif hari ini`} actions={<button onClick={() => fetchAntrian(filters)} className="btn-secondary inline-flex items-center gap-2"><RefreshCw size={16} />Refresh</button>} />

      <Card className="flex flex-wrap items-end gap-3 !p-4">
        <input
          type="text"
          placeholder="Filter poli..."
          value={filters.poli}
          onChange={(e) => setFilters({ ...filters, poli: e.target.value })}
          className="w-40"
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="w-32"
        >
          <option value="">Semua Status</option>
          <option value="putih">Putih</option>
          <option value="hijau">Hijau</option>
          <option value="kuning">Kuning</option>
          <option value="merah">Merah</option>
        </select>
        <label className="flex h-11 items-center gap-2 rounded-xl border border-[#d9e0ea] px-3">
          <input
            type="checkbox"
            checked={filters.prioritas}
            onChange={(e) => setFilters({ ...filters, prioritas: e.target.checked })}
          />
          <span className="text-sm">Prioritas</span>
        </label>
      </Card>

      <div className="overflow-x-auto rounded-2xl border border-[#e5eaf1] bg-white shadow-[0_8px_24px_rgba(28,45,72,.05)]">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">No. Antrian</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Pasien</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Poli</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Layanan</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Prioritas</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {antrian.map((item) => (
              <tr key={item.id} className={STATUS_BG[item.status_antrian]}>
                <td className="px-4 py-3 font-mono font-bold text-lg text-gray-900">
                  {item.no_antrian}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{item.id}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{item.poli}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{item.layanan}</td>
                <td className="px-4 py-3">
                  {canEditStatus ? (
                    <select
                      value={item.status_antrian}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className={`rounded px-2 py-1 text-xs font-semibold ${STATUS_COLORS[item.status_antrian]}`}
                    >
                      <option value="putih">Putih</option>
                      <option value="hijau">Hijau</option>
                      <option value="kuning">Kuning</option>
                      <option value="merah">Merah</option>
                    </select>
                  ) : (
                    <span className={`inline-block rounded px-2 py-1 text-xs font-semibold ${STATUS_COLORS[item.status_antrian]}`}>
                      {item.status_antrian}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {item.prioritas ? <span className="text-lg">⭐</span> : '-'}
                </td>
                <td className="px-4 py-3 space-x-2">
                  {canPrioritize && (
                    <button
                      onClick={() => handlePrioritize(item.id, item)}
                      className="btn-secondary text-xs"
                    >
                      {item.prioritas ? 'Unprioritize' : 'Prioritize'}
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
};
