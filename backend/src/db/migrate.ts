import pool from './pool.js';
import { fileURLToPath } from 'node:url';

const migrations = [
  {
    name: '001_init_schema',
    up: `
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role_id INTEGER REFERENCES roles(id),
        permissions TEXT[] DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS pasien (
        id SERIAL PRIMARY KEY,
        no_rm VARCHAR(50) UNIQUE NOT NULL,
        nama VARCHAR(200) NOT NULL,
        tanggal_lahir DATE,
        no_telepon VARCHAR(20),
        alamat TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS kunjungan (
        id SERIAL PRIMARY KEY,
        pasien_id INTEGER NOT NULL REFERENCES pasien(id),
        no_antrian VARCHAR(20),
        tanggal_kunjungan DATE NOT NULL,
        poli VARCHAR(100),
        layanan VARCHAR(100),
        status_antrian VARCHAR(50) DEFAULT 'putih',
        prioritas INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS antrian_log (
        id SERIAL PRIMARY KEY,
        kunjungan_id INTEGER NOT NULL REFERENCES kunjungan(id),
        status_lama VARCHAR(50),
        status_baru VARCHAR(50) NOT NULL,
        changed_by INTEGER REFERENCES users(id),
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS antropometri (
        id SERIAL PRIMARY KEY,
        kunjungan_id INTEGER NOT NULL REFERENCES kunjungan(id),
        tinggi DECIMAL(5,2),
        berat DECIMAL(5,2),
        lingkar_kepala DECIMAL(5,2),
        umur_bulan INTEGER,
        catatan TEXT,
        created_by_user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE antropometri ADD COLUMN IF NOT EXISTS catatan TEXT;

      UPDATE kunjungan SET status_antrian = 'putih' WHERE status_antrian = 'menunggu';
      UPDATE kunjungan SET status_antrian = 'hijau' WHERE status_antrian = 'dipanggil';
      UPDATE kunjungan SET status_antrian = 'kuning' WHERE status_antrian = 'sedang_diperiksa';
      UPDATE kunjungan SET status_antrian = 'merah' WHERE status_antrian = 'selesai';
      UPDATE antrian_log SET status_lama = 'putih' WHERE status_lama = 'menunggu';
      UPDATE antrian_log SET status_lama = 'hijau' WHERE status_lama = 'dipanggil';
      UPDATE antrian_log SET status_lama = 'kuning' WHERE status_lama = 'sedang_diperiksa';
      UPDATE antrian_log SET status_lama = 'merah' WHERE status_lama = 'selesai';
      UPDATE antrian_log SET status_baru = 'putih' WHERE status_baru = 'menunggu';
      UPDATE antrian_log SET status_baru = 'hijau' WHERE status_baru = 'dipanggil';
      UPDATE antrian_log SET status_baru = 'kuning' WHERE status_baru = 'sedang_diperiksa';
      UPDATE antrian_log SET status_baru = 'merah' WHERE status_baru = 'selesai';

      CREATE INDEX IF NOT EXISTS idx_kunjungan_pasien_id ON kunjungan(pasien_id);
      CREATE INDEX IF NOT EXISTS idx_kunjungan_tanggal ON kunjungan(tanggal_kunjungan);
      CREATE INDEX IF NOT EXISTS idx_antrian_log_kunjungan ON antrian_log(kunjungan_id);
      CREATE INDEX IF NOT EXISTS idx_antropometri_kunjungan ON antropometri(kunjungan_id);
    `,
  },
];

async function runMigrations() {
  const client = await pool.connect();
  try {
    for (const migration of migrations) {
      await client.query(migration.up);
      console.log(`Migration ${migration.name} completed`);
    }
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runMigrations()
    .then(() => {
      console.log('All migrations completed');
      process.exit(0);
    })
    .catch(() => process.exit(1));
}

export default runMigrations;
