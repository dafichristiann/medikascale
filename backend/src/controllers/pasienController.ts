import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import * as pasienService from '../services/pasienService.js';

export async function getPasienDetail(req: AuthRequest, res: Response) {
  try {
    const data = await pasienService.getPasienById(parseInt(req.params.id, 10));
    if (!data) {
      return res.status(404).json({ error: 'Pasien not found' });
    }
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getKunjunganByPasien(req: AuthRequest, res: Response) {
  try {
    const filters = {
      status_antrian: req.query.status_antrian,
      tanggal_dari: req.query.tanggal_dari,
    };

    const data = await pasienService.getKunjunganByPasien(parseInt(req.params.pasien_id, 10), filters);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
