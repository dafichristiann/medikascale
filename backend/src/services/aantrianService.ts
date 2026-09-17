import pool from '../db/pool.js';

export async function getKunjunganList(filters: any) {
  let query = `
    SELECT k.id, k.no_antrian, k.tanggal_kunjungan, k.poli, k.layanan, k.status_antrian, k.prioritas,
           k.created_at, k.updated_at,
           p.id as pasien_id, p.nama, p.no_rm
    FROM kunjungan k
    JOIN pasien p ON k.pasien_id = p.id
    WHERE 1=1
  `;
  const params: any[] = [];
  let paramCount = 1;

  if (filters.poli) {
    query += ` AND k.poli = $${paramCount}`;
    params.push(filters.poli);
    paramCount++;
  }
  if (filters.layanan) {
    query += ` AND k.layanan = $${paramCount}`;
    params.push(filters.layanan);
    paramCount++;
  }
  const status = filters.status || filters.status_antrian;
  if (status) {
    query += ` AND k.status_antrian = $${paramCount}`;
    params.push(status);
    paramCount++;
  }
  const tanggal = filters.tanggal_kunjungan || filters.tanggal || filters.date;
  if (tanggal) {
    query += ` AND DATE(k.tanggal_kunjungan) = $${paramCount}`;
    params.push(tanggal);
    paramCount++;
  }
  if (filters.prioritas === true || filters.prioritas === 'true' || filters.prioritas === 1 || filters.prioritas === '1') {
    query += ` AND k.prioritas = 1`;
  }

  query += ' ORDER BY k.prioritas DESC, k.created_at ASC';

  const result = await pool.query(query, params);
  return result.rows.map((row: any) => ({
    ...row,
    prioritas: row.prioritas === 1 || row.prioritas === true,
  }));
}

export async function getKunjunganById(id: number) {
  const result = await pool.query(
    `SELECT k.id, k.no_antrian, k.tanggal_kunjungan, k.poli, k.layanan, k.status_antrian, k.prioritas,
            k.created_at, k.updated_at,
            p.id as pasien_id, p.nama, p.no_rm, p.tanggal_lahir, p.no_telepon, p.alamat
     FROM kunjungan k
     JOIN pasien p ON k.pasien_id = p.id
     WHERE k.id = $1`,
    [id]
  );
  const row = result.rows[0];
  if (!row) return row;
  return { ...row, prioritas: row.prioritas === 1 || row.prioritas === true };
}

export async function updateKunjunganStatus(id: number, status: string, prioritas: number | undefined, changedByUserId: number) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const current = await client.query(
      'SELECT status_antrian, prioritas FROM kunjungan WHERE id = $1 FOR UPDATE',
      [id]
    );

    if (current.rows.length === 0) {
      throw new Error('Kunjungan tidak ditemukan');
    }

    const oldStatus = current.rows[0].status_antrian;
    const newPrioritas = prioritas === undefined ? current.rows[0].prioritas : prioritas;

    await client.query(
      'UPDATE kunjungan SET status_antrian = $1, prioritas = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [status, newPrioritas, id]
    );

    await client.query(
      'INSERT INTO antrian_log (kunjungan_id, status_lama, status_baru, changed_by) VALUES ($1, $2, $3, $4)',
      [id, oldStatus || null, status, changedByUserId]
    );

    await client.query('COMMIT');
    return {
      id,
      status_antrian: status,
      prioritas: newPrioritas === 1 || newPrioritas === true,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getAantrianLog(kunjunganId: number) {
  const result = await pool.query(
    `SELECT al.id, al.kunjungan_id, al.status_lama, al.status_baru, al.changed_at,
            u.username as changed_by_username
     FROM antrian_log al
     LEFT JOIN users u ON al.changed_by = u.id
     WHERE al.kunjungan_id = $1
     ORDER BY al.changed_at ASC`,
    [kunjunganId]
  );
  return result.rows;
}
