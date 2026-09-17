import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import * as antropometriService from '../services/antropometriService.js';
import Joi from 'joi';

const createAntropometriSchema = Joi.object({
  kunjungan_id: Joi.alternatives().try(Joi.number().integer(), Joi.string()).required(),
  tinggi: Joi.number().min(50).max(220).required(),
  berat: Joi.number().min(2).max(150).required(),
  lingkar_kepala: Joi.number().min(25).max(60).optional().allow(null, ''),
  umur_bulan: Joi.number().integer().min(0).max(120).optional().allow(null),
  catatan: Joi.string().allow('', null).optional(),
});

export async function createAntropometri(req: AuthRequest, res: Response) {
  try {
    const { error, value } = createAntropometriSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message, code: 'VALIDATION_ERROR' });
    }

    const data = await antropometriService.createAntropometri(
      Number(value.kunjungan_id),
      value.tinggi,
      value.berat,
      value.lingkar_kepala ? Number(value.lingkar_kepala) : null,
      value.umur_bulan ?? null,
      value.catatan || null,
      req.user!.id
    );

    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message, code: 'INTERNAL_ERROR' });
  }
}

export async function getAntropometriByPasien(req: AuthRequest, res: Response) {
  try {
    const data = await antropometriService.getAntropometriByPasien(parseInt(req.params.pasien_id, 10));
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message, code: 'INTERNAL_ERROR' });
  }
}

export async function getAntropometriReport(req: AuthRequest, res: Response) {
  try {
    const filters = {
      poli: req.query.poli,
      tanggal_dari: req.query.tanggal_dari || req.query.start_date,
      tanggal_sampai: req.query.tanggal_sampai || req.query.end_date,
    };

    const data = await antropometriService.getAntropometriReport(filters);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message, code: 'INTERNAL_ERROR' });
  }
}
