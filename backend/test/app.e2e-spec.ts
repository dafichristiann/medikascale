import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('MedikaScale API (e2e)', () => {
  let app: INestApplication;
  let dokterToken: string;
  let perawatToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Autentikasi & RBAC', () => {
    it('POST /api/auth/login - Login dokter sukses dan mengembalikan permissions', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'dokter', password: 'demo123' })
        .expect(200);

      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('permissions');
      expect(Array.isArray(res.body.user.permissions)).toBe(true);
      expect(res.body.user.permissions).toContain('antrian.view');
      expect(res.body.user.permissions).toContain('antrian.ubah_status');
      dokterToken = res.body.token;
    });

    it('POST /api/auth/login - Login perawat sukses', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'perawat', password: 'demo123' })
        .expect(200);

      expect(res.body.user.permissions).toContain('antropometri.input');
      expect(res.body.user.permissions).toContain('antrian.prioritaskan');
      perawatToken = res.body.token;
    });

    it('POST /api/auth/login - Tolak kredensial salah dengan 401', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'dokter', password: 'wrongpassword' })
        .expect(401);
    });
  });

  describe('Layanan Katalog', () => {
    it('GET /api/layanan - Mengembalikan katalog layanan', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/layanan')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Antrian Pasien', () => {
    it('GET /api/antrian - Akses ditolak (401) tanpa token', async () => {
      await request(app.getHttpServer())
        .get('/api/antrian')
        .expect(401);
    });

    it('GET /api/antrian - Mengembalikan daftar kunjungan dengan token dokter', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/antrian')
        .set('Authorization', `Bearer ${dokterToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('pasien');
        expect(res.body[0]).toHaveProperty('layanan');
      }
    });

    it('PATCH /api/antrian/:id/prioritas - Dokter ditolak 403 (tidak punya permission prioritaskan)', async () => {
      await request(app.getHttpServer())
        .patch('/api/antrian/101/prioritas')
        .set('Authorization', `Bearer ${dokterToken}`)
        .send({ prioritas: true })
        .expect(403);
    });

    it('PATCH /api/antrian/:id/prioritas - Perawat berhasil menandai prioritas', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/antrian/101/prioritas')
        .set('Authorization', `Bearer ${perawatToken}`)
        .send({ prioritas: true })
        .expect(200);

      expect(res.body.prioritas).toBe(true);
    });
  });

  describe('Antropometri WHO', () => {
    it('POST /api/antropometri - Perawat menyimpan hasil ukur & hitung z-score WHO', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/antropometri')
        .set('Authorization', `Bearer ${perawatToken}`)
        .send({
          kunjungan_id: 103,
          pasien_id: 3,
          usia_bulan: 18,
          berat_badan_kg: 10.2,
          tinggi_badan_cm: 79.5,
          lingkar_kepala_cm: 45.8,
        })
        .expect(201);

      expect(res.body).toHaveProperty('z_score_bb_u');
      expect(res.body).toHaveProperty('z_score_tb_u');
      expect(res.body).toHaveProperty('z_score_bb_tb');
      expect(res.body).toHaveProperty('interpretasi');
    });
  });

  describe('Dashboard & Stubs', () => {
    it('GET /api/dashboard/summary - Mengembalikan agregasi ringkasan', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${dokterToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('total_pasien');
      expect(res.body).toHaveProperty('menunggu_putih');
    });

    it('GET /api/arsip/cari - Stub arsip berfungsi', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/arsip/cari?q=Bilqis')
        .set('Authorization', `Bearer ${dokterToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
