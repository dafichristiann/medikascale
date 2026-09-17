import pool from '../db/pool.js';
export async function createAntropometri(kunjunganId, tinggi, berat, lingkarKepala, umurBulan, catatan, createdByUserId) {
    let umur = umurBulan;
    if (umur === null || umur === undefined) {
        const kunj = await pool.query(`SELECT p.tanggal_lahir FROM kunjungan k JOIN pasien p ON p.id = k.pasien_id WHERE k.id = $1`, [kunjunganId]);
        const tglLahir = kunj.rows[0]?.tanggal_lahir;
        if (tglLahir) {
            const born = new Date(tglLahir).getTime();
            const now = Date.now();
            umur = Math.max(0, Math.floor((now - born) / (1000 * 60 * 60 * 24 * 30.4375)));
        }
    }
    const result = await pool.query(`INSERT INTO antropometri (kunjungan_id, tinggi, berat, lingkar_kepala, umur_bulan, catatan, created_by_user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`, [kunjunganId, tinggi, berat, lingkarKepala, umur, catatan, createdByUserId]);
    return result.rows[0];
}
export async function getAntropometriByPasien(pasienId) {
    const result = await pool.query(`SELECT a.*, k.tanggal_kunjungan, u.username as created_by_username
     FROM antropometri a
     JOIN kunjungan k ON a.kunjungan_id = k.id
     JOIN users u ON a.created_by_user_id = u.id
     WHERE k.pasien_id = $1
     ORDER BY a.created_at DESC`, [pasienId]);
    return result.rows;
}
export async function getAntropometriReport(filters) {
    let query = `
    SELECT a.id, a.tinggi, a.berat, a.lingkar_kepala, a.umur_bulan, a.created_at,
           p.id as pasien_id, p.nama, k.poli, k.layanan
    FROM antropometri a
    JOIN kunjungan k ON a.kunjungan_id = k.id
    JOIN pasien p ON k.pasien_id = p.id
    WHERE 1=1
  `;
    const params = [];
    let paramCount = 1;
    if (filters.poli) {
        query += ` AND k.poli = $${paramCount}`;
        params.push(filters.poli);
        paramCount++;
    }
    if (filters.tanggal_dari) {
        query += ` AND DATE(a.created_at) >= $${paramCount}`;
        params.push(filters.tanggal_dari);
        paramCount++;
    }
    if (filters.tanggal_sampai) {
        query += ` AND DATE(a.created_at) <= $${paramCount}`;
        params.push(filters.tanggal_sampai);
        paramCount++;
    }
    query += ' ORDER BY a.created_at DESC';
    const result = await pool.query(query, params);
    const data = result.rows;
    return {
        total: data.length,
        normal: data.length,
        'at-risk': 0,
        malnutrition: 0,
        data: data.map((row) => ({ ...row, status: 'normal' })),
    };
}
//# sourceMappingURL=antropometriService.js.map