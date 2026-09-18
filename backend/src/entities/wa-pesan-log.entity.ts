import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { WaSesi } from './wa-sesi.entity';
import { Kunjungan } from './kunjungan.entity';

@Entity('wa_pesan_log')
export class WaPesanLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  wa_sesi_id: number;

  @ManyToOne(() => WaSesi)
  @JoinColumn({ name: 'wa_sesi_id' })
  wa_sesi: WaSesi;

  @Column({ nullable: true })
  kunjungan_id: number;

  @ManyToOne(() => Kunjungan, { nullable: true })
  @JoinColumn({ name: 'kunjungan_id' })
  kunjungan: Kunjungan;

  @Column({ length: 6 })
  arah: string; // 'masuk' | 'keluar'

  @Column({ type: 'text' })
  isi_pesan: string;

  @Column({ length: 15, default: 'terkirim' })
  status_kirim: string;

  @CreateDateColumn({ type: 'timestamp' })
  waktu: Date;
}
