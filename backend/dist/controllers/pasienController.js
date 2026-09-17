import * as pasienService from '../services/pasienService.js';
export async function getPasienDetail(req, res) {
    try {
        const data = await pasienService.getPasienById(parseInt(req.params.id, 10));
        if (!data) {
            return res.status(404).json({ error: 'Pasien not found' });
        }
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
export async function getKunjunganByPasien(req, res) {
    try {
        const filters = {
            status_antrian: req.query.status_antrian,
            tanggal_dari: req.query.tanggal_dari,
        };
        const data = await pasienService.getKunjunganByPasien(parseInt(req.params.pasien_id, 10), filters);
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
//# sourceMappingURL=pasienController.js.map