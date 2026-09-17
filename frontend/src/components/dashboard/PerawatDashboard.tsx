import { useEffect, useState } from 'react';
import { useAntrianStore } from '../../store/antrianStore';
import { AntropolopoInput } from '../antropometri/AntropolopoInput';

export const PerawatDashboard = () => {
  const { antrian, fetchAntrian } = useAntrianStore();
  const [showInputForm, setShowInputForm] = useState(false);

  useEffect(() => {
    fetchAntrian({ tanggal: new Date().toISOString().split('T')[0] });
    const interval = setInterval(() => {
      fetchAntrian({ tanggal: new Date().toISOString().split('T')[0] });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalAntrian = antrian.length;
  const pendingAntrian = antrian.filter((a) => a.status_antrian === 'putih').length;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Dashboard Perawat</h2>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-blue-50 p-6 shadow-sm border-l-4 border-blue-600">
          <p className="text-sm font-medium text-gray-600">Total Antrian Hari Ini</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">{totalAntrian}</p>
        </div>
        <div className="rounded-lg bg-orange-50 p-6 shadow-sm border-l-4 border-orange-600">
          <p className="text-sm font-medium text-gray-600">Menunggu Panggilan</p>
          <p className="mt-2 text-3xl font-bold text-orange-600">{pendingAntrian}</p>
        </div>
      </div>

      {/* Antrian Table */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-xl font-semibold text-gray-900">Antrian Hari Ini</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">No. Antrian</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Pasien</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Poli</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Waktu Tiba</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {antrian.slice(0, 10).map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-bold text-lg">{item.no_antrian}</td>
                  <td className="px-4 py-3">{item.id}</td>
                  <td className="px-4 py-3">{item.poli}</td>
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
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {new Date(item.created_at).toLocaleTimeString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Input Antropometri */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">Input Antropometri Cepat</h3>
          <button
            onClick={() => setShowInputForm(!showInputForm)}
            className="btn-primary text-sm"
          >
            {showInputForm ? 'Tutup' : 'Buka Form'}
          </button>
        </div>
        {showInputForm && (
          <div className="mt-4">
            <AntropolopoInput />
          </div>
        )}
      </div>

      {/* Pending Antropometri */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-xl font-semibold text-gray-900">Pasien Menunggu Pengukuran</h3>
        <div className="space-y-2">
          {antrian
            .filter((a) => a.status_antrian === 'hijau' || a.status_antrian === 'kuning')
            .map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded bg-blue-50 p-3">
                <div>
                  <p className="font-semibold text-gray-900">Antrian #{item.no_antrian}</p>
                  <p className="text-sm text-gray-600">{item.poli}</p>
                </div>
                <button className="btn-secondary text-xs">Ukur Sekarang</button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
