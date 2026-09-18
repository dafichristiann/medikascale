import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Role,
  Permission,
  User,
  Pasien,
  Layanan,
  Kunjungan,
  AntrianLog,
  WaSesi,
  WaPesanLog,
  AntropometriPengukuran,
  PemeriksaanDokter,
  ResepObat,
  PemeriksaanPenunjang,
  ArsipDokumen,
  ArsipTracking,
  Notifikasi,
  ArsipLokasi,
  ArsipMap,
  ArsipPinjam,
  ArsipPinjamDetail,
} from './entities';
import { AuthModule } from './modules/auth/auth.module';
import { LayananModule } from './modules/layanan/layanan.module';
import { AntrianModule } from './modules/antrian/antrian.module';
import { AntropometriModule } from './modules/antropometri/antropometri.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { WhatsAppModule } from './modules/whatsapp/whatsapp.module';
import { StubsModule } from './modules/stubs/stubs.module';
import { KlinisModule } from './modules/klinis/klinis.module';
import { NotifikasiModule } from './modules/notifikasi/notifikasi.module';
import { AdminModule } from './modules/admin/admin.module';
import { ArsipModule } from './modules/arsip/arsip.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.get<string>('DB_NAME', 'medikascale'),
        entities: [
          Role,
          Permission,
          User,
          Pasien,
          Layanan,
          Kunjungan,
          AntrianLog,
          WaSesi,
          WaPesanLog,
          AntropometriPengukuran,
          PemeriksaanDokter,
          ResepObat,
          PemeriksaanPenunjang,
          ArsipDokumen,
          ArsipTracking,
          Notifikasi,
          ArsipLokasi,
          ArsipMap,
          ArsipPinjam,
          ArsipPinjamDetail,
        ],
        synchronize: false, // Schema is managed via explicit SQL DDL
        logging: false,
      }),
    }),
    AuthModule,
    LayananModule,
    AntrianModule,
    AntropometriModule,
    DashboardModule,
    WhatsAppModule,
    StubsModule,
    KlinisModule,
    NotifikasiModule,
    AdminModule,
    ArsipModule,
  ],
})
export class AppModule {}
