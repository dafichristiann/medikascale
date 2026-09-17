import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import * as aantrianService from '../services/aantrianService.js';
import Joi from 'joi';

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('putih', 'hijau', 'kuning', 'merah').optional(),
  status_baru: Joi.string().valid('putih', 'hijau', 'kuning', 'merah').optional(),
  prioritas: Joi.alternatives().try(Joi.boolean(), Joi.number().integer().min(0).max(1)).optional(),
}).or('status', 'status_baru');

export async function getKunjunganList(req: AuthRequest, res: Response) {
  try {
    const filters = {
      poli: req.query.poli,
      layanan: req.query.layanan,
      status: req.query.status,
      status_antrian: req.query.status_antrian,
      tanggal: req.query.tanggal,
      tanggal_kunjungan: req.query.tanggal_kunjungan,
      prioritas: req.query.prioritas,
      date: req.query.date,
    };

    const data = await aantrianService.getKunjunganList(filters);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message, code: 'INTERNAL_ERROR' });
  }
}

export async function getKunjunganDetail(req: AuthRequest, res: Response) {
  try {
    const data = await aantrianService.getKunjunganById(parseInt(req.params.id, 10));
    if (!data) {
      return res.status(404).json({ message: 'Kunjungan tidak ditemukan', code: 'NOT_FOUND' });
    }
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message, code: 'INTERNAL_ERROR' });
  }
}

export async function updateKunjunganStatus(req: AuthRequest, res: Response) {
  try {
    const { error, value } = updateStatusSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message, code: 'VALIDATION_ERROR' });
    }

    const statusBaru = value.status ?? value.status_baru;
    const prioritas = value.prioritas === undefined ? undefined : Number(Boolean(value.prioritas));

    const result = await aantrianService.updateKunjunganStatus(
      parseInt(req.params.id, 10),
      statusBaru,
      prioritas,
      req.user!.id
    );

    try {
      const { emitAntrianUpdate } = await import('../app.js');
      emitAntrianUpdate({
        kunjungan_id: result.id,
        status: result.status_antrian,
        prioritas: result.prioritas,
        timestamp: new Date().toISOString(),
      });
    } catch {
      // realtime best-effort only
    }

    res.json(result);
  } catch (err: any) {
    const code = err.message === 'Kunjungan tidak ditemukan' ? 404 : 500;
    res.status(code).json({ message: err.message, code: code === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR' });
  }
}

export async function getAantrianLog(req: AuthRequest, res: Response) {
  try {
    const data = await aantrianService.getAantrianLog(parseInt(req.params.kunjungan_id, 10));
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message, code: 'INTERNAL_ERROR' });
  }
}
