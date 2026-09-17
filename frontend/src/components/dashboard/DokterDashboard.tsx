import { useEffect } from 'react';
import { useAntrianStore } from '../../store/antrianStore';
import { useAuthStore } from '../../store/authStore';

export const DokterDashboard = () => {
  const { antrian, fetchAntrian } = useAntrianStore();
  const { hasPermission } = useAuthStore();

  useEffect(() => {
    fetchAntrian({ tanggal: new Date().toISOString().split('T')[0] });
    const interval = setInterval(() => {
      fetchAntrian({ tanggal: new Date().toISOString().split('T')[0] });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalAntrian = antrian.length;
  const prioritasCount = antrian.filter((a) => a.prioritas).length;
  const avgWaitTime = Math.round(
    antrian.reduce((sum, a) => {
      const created = new Date(a.created_at).getTime();
      const now = new Date().getTime();
      return sum + (now - created);
    }, 0) / Math.max(totalAntrian, 1) / 1000 / 60
  );

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Dashboard Dokter</h2>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-blue-50 p-6 shadow-sm border-l-4 border-blue-600">
          <p className="text-sm font-medium text-gray-600">Total Antrian Hari Ini</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">{totalAntrian}</p>
        </div>
        <div className="rounded-lg bg-red-50 p-6 shadow-sm border-l-4 border-red-600">
          <p className="text-sm font-medium text-gray-600">Pasien Prioritas</p>
          <p className="mt-2 text-3xl font-bold text-red-600">{prioritasCount}</p>
        </div>
        <div className="rounded-lg bg-yellow-50 p-6 shadow-sm border-l-4 border-yellow-600">
          <p className="text-sm font-medium text-gray-600">Rata-rata Waktu Tunggu</p>
          <p className="mt-2 text-3xl font-bold text-yellow-600">{avgWaitTime} min</p>
        </div>
      </div>

      {/* Antrian Table */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-xl font-semibold text-gray-900">Antrian Hari Ini</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">No. Antrian</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Pasien</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Poli</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Prioritas</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Waktu Tunggu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {antrian.slice(0, 10).map((item) => {
                const waitTime = Math.round(
                  (new Date().getTime() - new Date(item.created_at).getTime()) / 1000 / 60
                );
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-bold text-lg">{item.no_antrian}</td>
                    <td className="px-4 py-3 text-sm">{item.id}</td>
                    <td className="px-4 py-3 text-sm">{item.poli}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                          item.status_antrian === 'hijau'
                            ? 'bg-green-100 text-green-800'
                            : item.status_antrian === 'kuning'
                            ? 'bg-yellow-100 text-yellow-800'
                            : item.status_antrian === 'merah'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {item.status_antrian}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.prioritas ? <span className="text-lg">⭐</span> : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">{waitTime} min</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {hasPermission('antrian.prioritaskan') && (
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-xl font-semibold text-gray-900">Aksi Cepat</h3>
          <button className="btn-primary">Tampilkan di Layar Utama</button>
        </div>
      )}
    </div>
  );
};
