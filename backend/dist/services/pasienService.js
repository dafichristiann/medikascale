import pool from '../db/pool.js';
export async function getPasienById(id) {
    const result = await pool.query('SELECT * FROM pasien WHERE id = $1', [id]);
    return result.rows[0];
}
export async function getKunjunganByPasien(pasienId, filters = {}) {
    let query = `
    SELECT k.id, k.no_antrian, k.tanggal_kunjungan, k.poli, k.layanan, k.status_antrian, k.prioritas
    FROM kunjungan k
    WHERE k.pasien_id = $1
  `;
    const params = [pasienId];
    let paramCount = 2;
    if (filters.status_antrian) {
        query += ` AND k.status_antrian = $${paramCount}`;
        params.push(filters.status_antrian);
        paramCount++;
    }
    if (filters.tanggal_dari) {
        query += ` AND DATE(k.tanggal_kunjungan) >= $${paramCount}`;
        params.push(filters.tanggal_dari);
        paramCount++;
    }
    query += ' ORDER BY k.tanggal_kunjungan DESC';
    const result = await pool.query(query, params);
    return result.rows;
}
//# sourceMappingURL=pasienService.js.map