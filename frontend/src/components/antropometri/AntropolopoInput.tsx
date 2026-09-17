import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAntropolopoStore } from '../../store/antropometriStore';

const schema = z.object({
  kunjungan_id: z.string().min(1, 'Pilih kunjungan'),
  tinggi: z.number().min(50, 'Tinggi minimal 50 cm').max(220, 'Tinggi maksimal 220 cm'),
  berat: z.number().min(2, 'Berat minimal 2 kg').max(150, 'Berat maksimal 150 kg'),
  lingkar_kepala: z.number().optional().refine((v) => !v || (v >= 25 && v <= 60), 'Lingkar kepala 25-60 cm'),
  catatan: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export const AntropolopoInput = () => {
  const { inputMeasurement, loading } = useAntropolopoStore();
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await inputMeasurement(data);
      setSuccess(true);
      reset();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Input Antropometri</h2>

      <div className="max-w-md rounded-lg bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Kunjungan ID</label>
            <input
              type="text"
              placeholder="ID Kunjungan"
              {...register('kunjungan_id')}
              className="mt-1 w-full"
            />
            {errors.kunjungan_id && (
              <p className="mt-1 text-sm text-red-600">{errors.kunjungan_id.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tinggi (cm)</label>
            <input
              type="number"
              step="0.1"
              placeholder="Tinggi dalam cm"
              {...register('tinggi', { valueAsNumber: true })}
              className="mt-1 w-full"
            />
            {errors.tinggi && (
              <p className="mt-1 text-sm text-red-600">{errors.tinggi.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Berat (kg)</label>
            <input
              type="number"
              step="0.1"
              placeholder="Berat dalam kg"
              {...register('berat', { valueAsNumber: true })}
              className="mt-1 w-full"
            />
            {errors.berat && (
              <p className="mt-1 text-sm text-red-600">{errors.berat.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Lingkar Kepala (cm)</label>
            <input
              type="number"
              step="0.1"
              placeholder="Lingkar kepala dalam cm (opsional)"
              {...register('lingkar_kepala', { valueAsNumber: true })}
              className="mt-1 w-full"
            />
            {errors.lingkar_kepala && (
              <p className="mt-1 text-sm text-red-600">{errors.lingkar_kepala.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Catatan</label>
            <textarea
              placeholder="Catatan observer (opsional)"
              {...register('catatan')}
              className="mt-1 w-full"
              rows={3}
            />
          </div>

          {success && (
            <div className="rounded bg-green-50 p-3 text-sm text-green-700">
              Data antropometri berhasil disimpan
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Menyimpan...' : 'Simpan Pengukuran'}
          </button>
        </form>
      </div>
    </div>
  );
};
