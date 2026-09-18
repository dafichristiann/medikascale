import { useEffect, useState } from 'react';
import { ClipboardList, Syringe, Ruler, ScanSearch, Utensils } from 'lucide-react';
import { fetchLayanan } from '@/api/klinis';
import type { Layanan as LayananType } from '@/types';

const ICON_BY_NAME: Record<string, React.ElementType> = {
  SOAPIE: ClipboardList,
  Vaksin: Syringe,
  'Konsul Tumbuh Kembang': Ruler,
  'Deteksi/Skrining Tahap 2': ScanSearch,
  'Konsul Makan': Utensils,
};

const DESC_BY_NAME: Record<string, string> = {
  SOAPIE: 'Catatan pemeriksaan terintegrasi Subjective–Objective–Assessment–Plan–Implementation–Evaluation.',
  Vaksin: 'Imunisasi sesuai jadwal IDAI/Kemenkes, tercatat di ceklis imunisasi anak.',
  'Konsul Tumbuh Kembang': 'Evaluasi antropometri dan perkembangan anak dibanding kurva WHO.',
  'Deteksi/Skrining Tahap 2': 'Skrining lanjutan untuk deteksi dini gangguan tumbuh kembang.',
  'Konsul Makan': 'Konsultasi pola makan & gizi untuk anak dengan kesulitan makan.',
};

export default function Layanan() {
  const [items, setItems] = useState<LayananType[]>([]);

  useEffect(() => {
    fetchLayanan().then(setItems);
  }, []);

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold mb-1">Katalog layanan</h2>
        <p className="text-slate text-[13.5px] max-w-xl">
          Layanan yang muncul saat pasien mendaftar antrian, baik lewat loket maupun chatbot WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((l) => {
          const Icon = ICON_BY_NAME[l.nama] ?? ClipboardList;
          return (
            <div key={l.id} className="bg-white border border-border rounded-xl p-4.5">
              <div className="w-9 h-9 rounded-lg bg-teal-tint text-teal-dark flex items-center justify-center mb-3">
                <Icon size={18} />
              </div>
              <h4 className="font-bold text-[14.5px] mb-1.5">{l.nama}</h4>
              <p className="text-[12.5px] text-slate leading-relaxed">{DESC_BY_NAME[l.nama]}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
