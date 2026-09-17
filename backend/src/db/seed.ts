import pool from './pool.js';
import bcrypt from 'bcrypt';

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Roles
    await client.query(`
      INSERT INTO roles (name, description) VALUES
      ('admin', 'Administrator'),
      ('dokter', 'Doctor'),
      ('perawat', 'Nurse'),
      ('staff_antrian', 'Queue Staff')
      ON CONFLICT (name) DO NOTHING;
    `);

    // Users
    const adminHash = await bcrypt.hash('admin123', 10);
    const doktHash = await bcrypt.hash('dokter123', 10);
    const perawatHash = await bcrypt.hash('perawat123', 10);

    await client.query(`
      INSERT INTO users (username, password_hash, role_id, permissions) VALUES
      ($1, $2, (SELECT id FROM roles WHERE name = 'admin'), ARRAY['antrian.view', 'antrian.update_status', 'antrian.prioritaskan', 'antropometri.input', 'antropometri.view', 'dashboard.dokter', 'dashboard.perawat', 'rekam_medis.view', 'lab.view', 'resep.view']),
      ($3, $4, (SELECT id FROM roles WHERE name = 'dokter'), ARRAY['antrian.view', 'antrian.update_status', 'antrian.prioritaskan', 'antropometri.input', 'antropometri.view', 'dashboard.dokter', 'rekam_medis.view', 'lab.view', 'resep.view']),
      ($5, $6, (SELECT id FROM roles WHERE name = 'perawat'), ARRAY['antrian.view', 'antrian.update_status', 'antropometri.input', 'antropometri.view', 'dashboard.perawat', 'rekam_medis.view'])
      ON CONFLICT (username) DO UPDATE SET
        role_id = EXCLUDED.role_id,
        permissions = EXCLUDED.permissions;
    `, [
      'admin', adminHash,
      'dokter', doktHash,
      'perawat', perawatHash,
    ]);

    // Pasien
    await client.query(`
      INSERT INTO pasien (no_rm, nama, tanggal_lahir, no_telepon, alamat) VALUES
      ('RM-001', 'Budi Santoso', '1990-05-15', '081234567890', 'Jl. Merdeka No. 123'),
      ('RM-002', 'Siti Nurhaliza', '1995-08-22', '081987654321', 'Jl. Ahmad Yani No. 45'),
      ('RM-003', 'Ahmad Wijaya', '2015-03-10', '082123456789', 'Jl. Sudirman No. 78')
      ON CONFLICT (no_rm) DO NOTHING;
    `);

    // Kunjungan
    const today = new Date().toISOString().split('T')[0];
    await client.query(`
      INSERT INTO kunjungan (pasien_id, no_antrian, tanggal_kunjungan, poli, layanan, status_antrian, prioritas)
      SELECT 1, 'A-001', $1, 'Umum', 'Pemeriksaan Kesehatan', 'merah', 0
      WHERE NOT EXISTS (SELECT 1 FROM kunjungan WHERE no_antrian = 'A-001' AND tanggal_kunjungan = $1);
    `, [today]);
    await client.query(`
      INSERT INTO kunjungan (pasien_id, no_antrian, tanggal_kunjungan, poli, layanan, status_antrian, prioritas)
      SELECT 2, 'A-002', $1, 'Anak', 'Konsultasi', 'hijau', 1
      WHERE NOT EXISTS (SELECT 1 FROM kunjungan WHERE no_antrian = 'A-002' AND tanggal_kunjungan = $1);
    `, [today]);
    await client.query(`
      INSERT INTO kunjungan (pasien_id, no_antrian, tanggal_kunjungan, poli, layanan, status_antrian, prioritas)
      SELECT 3, 'A-003', $1, 'Umum', 'Vaksinasi', 'putih', 0
      WHERE NOT EXISTS (SELECT 1 FROM kunjungan WHERE no_antrian = 'A-003' AND tanggal_kunjungan = $1);
    `, [today]);

    // Antrian Log
    await client.query(`
      INSERT INTO antrian_log (kunjungan_id, status_lama, status_baru, changed_by)
      SELECT 1, 'putih', 'hijau', (SELECT id FROM users WHERE username = 'admin')
      WHERE NOT EXISTS (
        SELECT 1 FROM antrian_log
        WHERE kunjungan_id = 1 AND status_lama = 'putih' AND status_baru = 'hijau'
      );
    `);
    await client.query(`
      INSERT INTO antrian_log (kunjungan_id, status_lama, status_baru, changed_by)
      SELECT 1, 'hijau', 'merah', (SELECT id FROM users WHERE username = 'admin')
      WHERE NOT EXISTS (
        SELECT 1 FROM antrian_log
        WHERE kunjungan_id = 1 AND status_lama = 'hijau' AND status_baru = 'merah'
      );
    `);

    // Antropometri
    await client.query(`
      INSERT INTO antropometri (kunjungan_id, tinggi, berat, lingkar_kepala, umur_bulan, created_by_user_id)
      SELECT 1, 175.5, 70.0, NULL, NULL, (SELECT id FROM users WHERE username = 'perawat')
      WHERE NOT EXISTS (SELECT 1 FROM antropometri WHERE kunjungan_id = 1);
    `);
    await client.query(`
      INSERT INTO antropometri (kunjungan_id, tinggi, berat, lingkar_kepala, umur_bulan, created_by_user_id)
      SELECT 3, 105.0, 18.5, 51.2, 36, (SELECT id FROM users WHERE username = 'perawat')
      WHERE NOT EXISTS (SELECT 1 FROM antropometri WHERE kunjungan_id = 3);
    `);

    await client.query('COMMIT');
    console.log('✓ Seed data inserted');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

import { fileURLToPath } from 'node:url';

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  seed()
    .then(() => {
      console.log('Database seeding completed');
      process.exit(0);
    })
    .catch(() => process.exit(1));
}

export default seed;
