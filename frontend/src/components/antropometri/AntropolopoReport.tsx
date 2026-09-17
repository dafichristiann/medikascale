import { useState } from 'react';
import { useAntropolopoStore } from '../../store/antropometriStore';
import { exportAntrianCSV, exportAntropolopoPDF } from '../../utils/export';

export const AntropolopoReport = () => {
  const { fetchReport, loading } = useAntropolopoStore();
  const [report, setReport] = useState<any>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [poli, setPoli] = useState('');

  const handleFetchReport = async () => {
    try {
      const data = await fetchReport({ start_date: startDate, end_date: endDate, poli });
      setReport(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = () => {
    if (report?.data) {
      exportAntrianCSV(report.data, 'laporan-antropometri.csv');
    }
  };

  const handleExportPDF = async () => {
    await exportAntropolopoPDF('report-content', 'laporan-antropometri.pdf');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Laporan Antropometri</h2>

      <div className="flex gap-3 rounded-lg bg-white p-4 shadow-sm">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-40"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-40"
        />
        <input
          type="text"
          placeholder="Filter poli..."
          value={poli}
          onChange={(e) => setPoli(e.target.value)}
          className="w-40"
        />
        <button onClick={handleFetchReport} disabled={loading} className="btn-primary">
          {loading ? 'Loading...' : 'Buat Laporan'}
        </button>
      </div>

      {report && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button onClick={handleExportCSV} className="btn-secondary">
              Export CSV
            </button>
            <button onClick={handleExportPDF} className="btn-secondary">
              Export PDF
            </button>
          </div>

          <div id="report-content" className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xl font-semibold text-gray-900">
              Laporan Periode {startDate} - {endDate}
            </h3>

            <div className="mb-6 grid grid-cols-3 gap-4">
              <div className="rounded bg-blue-50 p-4">
                <p className="text-sm text-gray-600">Total Input</p>
                <p className="text-2xl font-bold text-blue-600">{report.total || 0}</p>
              </div>
              <div className="rounded bg-green-50 p-4">
                <p className="text-sm text-gray-600">Status Gizi Normal</p>
                <p className="text-2xl font-bold text-green-600">{report.normal || 0}</p>
              </div>
              <div className="rounded bg-red-50 p-4">
                <p className="text-sm text-gray-600">Gizi Buruk</p>
                <p className="text-2xl font-bold text-red-600">{report.malnutrition || 0}</p>
              </div>
            </div>

            {report.data && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Tanggal</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Poli</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Tinggi (cm)</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Berat (kg)</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Status Gizi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {report.data.map((row: any) => (
                      <tr key={row.id}>
                        <td className="px-4 py-2">{new Date(row.created_at).toLocaleDateString('id-ID')}</td>
                        <td className="px-4 py-2">{row.poli || '-'}</td>
                        <td className="px-4 py-2 font-mono">{row.tinggi}</td>
                        <td className="px-4 py-2 font-mono">{row.berat}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                            row.status === 'normal' ? 'bg-green-100 text-green-800' :
                            row.status === 'at-risk' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
