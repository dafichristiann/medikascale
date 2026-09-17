import { useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { AntropolopoInput } from '../components/antropometri/AntropolopoInput';
import { AntropolopoChart } from '../components/antropometri/AntropolopoChart';
import { AntropolopoReport } from '../components/antropometri/AntropolopoReport';

export const AntropolopoPage = () => {
  const [view, setView] = useState<'input' | 'chart' | 'report'>('input');
  const [selectedPasienId, setSelectedPasienId] = useState('');

  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Antropometri</h1>

        <div className="flex gap-2">
          <button
            onClick={() => setView('input')}
            className={`px-4 py-2 rounded font-medium transition ${
              view === 'input' ? 'btn-primary' : 'btn-secondary'
            }`}
          >
            Input Data
          </button>
          <button
            onClick={() => setView('chart')}
            className={`px-4 py-2 rounded font-medium transition ${
              view === 'chart' ? 'btn-primary' : 'btn-secondary'
            }`}
          >
            Lihat Grafik
          </button>
          <button
            onClick={() => setView('report')}
            className={`px-4 py-2 rounded font-medium transition ${
              view === 'report' ? 'btn-primary' : 'btn-secondary'
            }`}
          >
            Laporan
          </button>
        </div>

        {view === 'input' && <AntropolopoInput />}

        {view === 'chart' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Masukkan ID Pasien"
                value={selectedPasienId}
                onChange={(e) => setSelectedPasienId(e.target.value)}
                className="w-64"
              />
              <button
                onClick={() => {
                  if (selectedPasienId) {
                    // Chart will auto-fetch
                  }
                }}
                className="btn-primary"
              >
                Tampilkan Grafik
              </button>
            </div>
            {selectedPasienId && <AntropolopoChart pasien_id={selectedPasienId} />}
          </div>
        )}

        {view === 'report' && <AntropolopoReport />}
      </div>
    </MainLayout>
  );
};
