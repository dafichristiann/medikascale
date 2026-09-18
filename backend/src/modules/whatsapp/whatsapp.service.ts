import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { WaSesi } from '../../entities/wa-sesi.entity';
import { WaPesanLog } from '../../entities/wa-pesan-log.entity';
import { Pasien } from '../../entities/pasien.entity';
import { Layanan } from '../../entities/layanan.entity';
import { Kunjungan } from '../../entities/kunjungan.entity';
import { AntrianLog } from '../../entities/antrian-log.entity';
import { GenericWhatsAppAdapter } from './adapters/generic.adapter';
import { FonnteWhatsAppAdapter } from './adapters/fonnte.adapter';
import { IWhatsAppProviderAdapter } from './adapters/wa-provider.interface';

@Injectable()
export class WhatsAppService {
  private adapter: IWhatsAppProviderAdapter;

  constructor(
    @InjectRepository(WaSesi)
    private waSesiRepository: Repository<WaSesi>,
    @InjectRepository(WaPesanLog)
    private waPesanLogRepository: Repository<WaPesanLog>,
    @InjectRepository(Pasien)
    private pasienRepository: Repository<Pasien>,
    @InjectRepository(Layanan)
    private layananRepository: Repository<Layanan>,
    @InjectRepository(Kunjungan)
    private kunjunganRepository: Repository<Kunjungan>,
    @InjectRepository(AntrianLog)
    private antrianLogRepository: Repository<AntrianLog>,
    private genericAdapter: GenericWhatsAppAdapter,
    private fonnteAdapter: FonnteWhatsAppAdapter,
    private configService: ConfigService,
  ) {
    const fonnteToken = this.configService.get<string>('FONNTE_TOKEN');
    const provider = this.configService.get<string>('WA_PROVIDER');
    this.adapter = (provider === 'fonnte' || Boolean(fonnteToken)) ? this.fonnteAdapter : this.genericAdapter;
  }

  setAdapter(provider: 'generic' | 'fonnte') {
    this.adapter = provider === 'fonnte' ? this.fonnteAdapter : this.genericAdapter;
  }

  async processIncomingMessage(payload: any) {
    const { from, message } = this.adapter.parseInbound(payload);
    if (!from || !message) {
      return { success: false, error: 'Nomor atau pesan tidak valid' };
    }

    // 1. Cari atau inisialisasi sesi WA
    let sesi = await this.waSesiRepository.findOne({
      where: { no_telepon: from },
      relations: { pasien: true },
    });

    if (!sesi) {
      sesi = this.waSesiRepository.create({
        no_telepon: from,
        state: 'AWAL',
        konteks: {},
      });
      sesi = await this.waSesiRepository.save(sesi);
    }

    // 2. Log pesan masuk
    const incomingLog = this.waPesanLogRepository.create({
      wa_sesi_id: sesi.id,
      arah: 'masuk',
      isi_pesan: message,
      status_kirim: 'terkirim',
      waktu: new Date(),
    });
    await this.waPesanLogRepository.save(incomingLog);

    const inputLower = message.trim().toLowerCase();

    // Perintah global Batal / Reset
    if (inputLower === 'batal' || inputLower === 'reset' || inputLower === 'ulang') {
      sesi.state = 'AWAL';
      sesi.konteks = {};
      sesi.layanan_id_sementara = null;
      await this.waSesiRepository.save(sesi);

      const reply =
        '🔄 Sesi telah direset.\n\nKetik *Halo* atau *1* untuk memulai pendaftaran antrian pasien Poliklinik Anak.';
      await this.sendAndLogReply(sesi, reply);
      return { success: true, reply, state: sesi.state };
    }

    let reply = '';
    let linkedKunjunganId: number | null = null;
    const todayStr = new Date().toISOString().slice(0, 10);

    // State Machine
    switch (sesi.state) {
      case 'INPUT_RM': {
        const pasien = await this.pasienRepository.findOne({
          where: { no_rm: message.trim().toUpperCase() },
        });

        if (!pasien) {
          reply = `❌ Nomor Rekam Medis *${message.trim()}* tidak ditemukan.\n\nPastikan format No. RM sesuai (contoh: *RM-2024-018472*) atau ketik *Batal* untuk mengulang.`;
        } else {
          sesi.pasien_id = pasien.id;
          sesi.state = 'PILIH_LAYANAN';

          const layanans = await this.layananRepository.find({
            where: { aktif: true },
            order: { id: 'ASC' },
          });

          sesi.konteks = {
            pasien_nama: pasien.nama,
            pasien_rm: pasien.no_rm,
            layanan_ids: layanans.map((l) => l.id),
          };
          await this.waSesiRepository.save(sesi);

          const listTeks = layanans
            .map((l, index) => `${index + 1}. *${l.nama}*`)
            .join('\n');

          reply = `✅ Pasien Terverifikasi:\nNama: *${pasien.nama}*\nNo. RM: *${pasien.no_rm}*\n\nSilakan pilih layanan yang dituju:\n${listTeks}\n\nBalas dengan angka *1 - ${layanans.length}*:`;
        }
        break;
      }

      case 'PILIH_LAYANAN': {
        const choice = parseInt(message.trim(), 10);
        const layananIds: number[] = sesi.konteks?.layanan_ids || [];

        if (isNaN(choice) || choice < 1 || choice > layananIds.length) {
          reply = `Pilihan nomor layanan tidak valid. Silakan balas dengan angka *1 sampai ${layananIds.length}*, atau ketik *Batal*.`;
          break;
        }

        const selectedLayananId = layananIds[choice - 1];
        const layanan = await this.layananRepository.findOne({
          where: { id: selectedLayananId },
        });
        const pasien = await this.pasienRepository.findOne({
          where: { id: sesi.pasien_id! },
        });

        if (!pasien || !layanan) {
          reply = 'Terjadi kesalahan membaca data. Silakan ketik *Batal* untuk mengulang.';
          sesi.state = 'AWAL';
          await this.waSesiRepository.save(sesi);
          break;
        }

        // Periksa apakah pasien sudah memiliki antrian hari ini
        const existingKunjungan = await this.kunjunganRepository.findOne({
          where: {
            pasien_id: pasien.id,
            tanggal: todayStr,
          },
          relations: { layanan: true },
        });

        if (existingKunjungan) {
          reply = `ℹ️ Pasien *${pasien.nama}* sudah memiliki antrian hari ini:\n\n` +
            `Nomor Antrian: *${existingKunjungan.no_antrian}*\n` +
            `Layanan: *${existingKunjungan.layanan?.nama}*\n` +
            `Status: *${existingKunjungan.status_antrian.toUpperCase()}*\n\n` +
            `Silakan langsung menuju ke ruang tunggu Poliklinik Anak. Ketik *Halo* untuk kembali ke menu.`;
          sesi.state = 'AWAL';
          sesi.konteks = {};
          await this.waSesiRepository.save(sesi);
          break;
        }

        // Generate nomor antrian harian A01..A99
        const allHariIni = await this.kunjunganRepository.find({
          where: { tanggal: todayStr },
          select: { id: true, no_antrian: true },
        });

        let maxSeq = 0;
        for (const item of allHariIni) {
          const match = item.no_antrian?.match(/^A(\d+)$/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxSeq) maxSeq = num;
          }
        }
        const seqNum = maxSeq + 1;

        if (seqNum > 99) {
          reply =
            `⚠️ Mohon maaf, kuota nomor antrian Poliklinik Anak hari ini (${todayStr}) telah penuh (maksimal A99).\n\n` +
            `Silakan mendaftar untuk jadwal hari kerja berikutnya atau hubungi loket pendaftaran fisik klinik.`;
          sesi.state = 'AWAL';
          sesi.konteks = {};
          await this.waSesiRepository.save(sesi);
          break;
        }

        const noAntrian = `A${String(seqNum).padStart(2, '0')}`;
        const noKunjungan = `ENC-${todayStr}-${String(seqNum).padStart(4, '0')}`;

        const kunjunganBaru = this.kunjunganRepository.create({
          no_kunjungan: noKunjungan,
          pasien_id: pasien.id,
          layanan_id: layanan.id,
          tanggal: todayStr,
          poli: 'Poliklinik Anak',
          no_antrian: noAntrian,
          status_antrian: 'putih',
          prioritas: false,
        });

        const savedKunjungan = await this.kunjunganRepository.save(kunjunganBaru);
        linkedKunjunganId = savedKunjungan.id;

        // Log antrian pertama
        const log = this.antrianLogRepository.create({
          kunjungan_id: savedKunjungan.id,
          status_dari: null,
          status_ke: 'putih',
          waktu: new Date(),
        });
        await this.antrianLogRepository.save(log);

        reply = `🎉 *PENDAFTARAN BERHASIL!*\n\n` +
          `Nomor Antrian Anda: *${noAntrian}*\n` +
          `No. Registrasi: \`${noKunjungan}\`\n` +
          `Pasien: *${pasien.nama}* (${pasien.no_rm})\n` +
          `Layanan: *${layanan.nama}*\n` +
          `Poli: *Poliklinik Anak*\n` +
          `Status: *Menunggu Pemeriksaan (Putih)*\n\n` +
          `Silakan datang dan tunjukkan nomor antrian ini saat dipanggil petugas. Pantau layar display antrian di poliklinik.\n` +
          `Ketik *2* kapan saja untuk mengecek status antrian.`;

        sesi.state = 'AWAL';
        sesi.konteks = {};
        await this.waSesiRepository.save(sesi);
        break;
      }

      case 'CEK_ANTRIAN': {
        const rm = message.trim().toUpperCase();
        const pasien = await this.pasienRepository.findOne({ where: { no_rm: rm } });

        if (!pasien) {
          reply = `Nomor RM *${rm}* tidak ditemukan. Ketik *Batal* untuk kembali ke menu.`;
          break;
        }

        const kunjungan = await this.kunjunganRepository.findOne({
          where: { pasien_id: pasien.id, tanggal: todayStr },
          relations: { layanan: true },
        });

        if (!kunjungan) {
          reply = `Pasien *${pasien.nama}* belum terdaftar dalam antrian hari ini (${todayStr}).\nKetik *1* untuk mendaftar antrian baru.`;
        } else {
          const statusLabels: Record<string, string> = {
            putih: 'Terdaftar / Menunggu ditimbang (Putih)',
            hijau: 'Sudah ditimbang, menunggu giliran dokter (Hijau)',
            kuning: 'Sedang diperiksa dokter (Kuning)',
            merah: 'Selesai pemeriksaan dokter, menunggu resep di apotek (Merah)',
          };

          reply = `📋 *Status Antrian Pasien Hari Ini:*\n\n` +
            `Nomor Antrian: *${kunjungan.no_antrian}*\n` +
            `Pasien: *${pasien.nama}* (${pasien.no_rm})\n` +
            `Layanan: *${kunjungan.layanan?.nama}*\n` +
            `Status Terkini: *${statusLabels[kunjungan.status_antrian] || kunjungan.status_antrian}*\n` +
            `Prioritas: ${kunjungan.prioritas ? '⭐ Prioritas Klinis' : 'Standar'}\n\n` +
            `Ketik *Halo* untuk kembali ke menu utama.`;
          linkedKunjunganId = kunjungan.id;
        }

        sesi.state = 'AWAL';
        await this.waSesiRepository.save(sesi);
        break;
      }

      case 'AWAL':
      default: {
        if (inputLower === '1' || inputLower.includes('daftar')) {
          sesi.state = 'INPUT_RM';
          await this.waSesiRepository.save(sesi);
          reply =
            'Silakan masukkan *Nomor Rekam Medis (No. RM)* pasien.\nContoh: *RM-2024-018472*';
        } else if (inputLower === '2' || inputLower.includes('cek')) {
          sesi.state = 'CEK_ANTRIAN';
          await this.waSesiRepository.save(sesi);
          reply = 'Silakan masukkan *Nomor Rekam Medis (No. RM)* pasien untuk cek status antrian:';
        } else {
          reply =
            'Halo! Selamat datang di *Layanan Mandiri WhatsApp MedikaScale* Poliklinik Anak 👶🏥\n\n' +
            'Silakan pilih menu:\n' +
            'Ketik *1* ➔ Daftar Antrian Pasien (pakai No. RM)\n' +
            'Ketik *2* ➔ Cek Status Antrian Hari Ini\n' +
            'Ketik *Batal* ➔ Reset sesi kapan saja.';
        }
        break;
      }
    }

    // 3. Simpan dan kirim balasan
    await this.sendAndLogReply(sesi, reply, linkedKunjunganId);

    return {
      success: true,
      reply,
      state: sesi.state,
      kunjungan_id: linkedKunjunganId,
    };
  }

  private async sendAndLogReply(
    sesi: WaSesi,
    replyMessage: string,
    kunjunganId?: number | null,
  ) {
    // Log pesan keluar
    const outLog = this.waPesanLogRepository.create({
      wa_sesi_id: sesi.id,
      arah: 'keluar',
      isi_pesan: replyMessage,
      status_kirim: 'terkirim',
      kunjungan_id: kunjunganId ?? undefined,
      waktu: new Date(),
    });
    await this.waPesanLogRepository.save(outLog);

    // Kirim lewat adapter
    await this.adapter.sendOutbound({
      to: sesi.no_telepon,
      message: replyMessage,
    });
  }

  async getSessionHistory(noTelepon: string) {
    const sesi = await this.waSesiRepository.findOne({
      where: { no_telepon: noTelepon },
    });
    if (!sesi) return [];

    return this.waPesanLogRepository.find({
      where: { wa_sesi_id: sesi.id },
      order: { waktu: 'ASC' },
    });
  }
}
