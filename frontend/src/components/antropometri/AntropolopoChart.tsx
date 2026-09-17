import { useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAntropolopoStore } from '../../store/antropometriStore';

interface AntropolopoChartProps {
  pasien_id: string;
}

export const AntropolopoChart = ({ pasien_id }: AntropolopoChartProps) => {
  const { measurements, loading, fetchHistory } = useAntropolopoStore();

  useEffect(() => {
    fetchHistory(pasien_id);
  }, [pasien_id]);

  if (loading) {
    return <div className="text-center py-8">Loading charts...</div>;
  }

  if (measurements.length === 0) {
    return <div className="text-center text-gray-500 py-8">No measurement data available</div>;
  }

  const chartData = measurements.map((m) => ({
    date: new Date(m.created_at).toLocaleDateString('id-ID'),
    tinggi: m.tinggi,
    berat: m.berat,
    lingkar_kepala: m.lingkar_kepala || null,
  }));

  return (
    <div className="space-y-6 rounded-lg bg-white p-6 shadow-sm">
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Grafik Tinggi Badan</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="tinggi" stroke="#3b82f6" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Grafik Berat Badan</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="berat" stroke="#10b981" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {measurements.some((m) => m.lingkar_kepala) && (
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Grafik Lingkar Kepala</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="lingkar_kepala" stroke="#f59e0b" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Riwayat Pengukuran</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Tanggal</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Tinggi (cm)</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Berat (kg)</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Lingkar Kepala (cm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {measurements.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-2">{new Date(m.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="px-4 py-2 font-mono">{m.tinggi}</td>
                  <td className="px-4 py-2 font-mono">{m.berat}</td>
                  <td className="px-4 py-2 font-mono">{m.lingkar_kepala || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
