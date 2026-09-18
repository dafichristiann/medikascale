import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Kunjungan } from './kunjungan.entity';
import { User } from './user.entity';

@Entity('resep_obat')
export class ResepObat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  kunjungan_id: number;

  @ManyToOne(() => Kunjungan)
  @JoinColumn({ name: 'kunjungan_id' })
  kunjungan: Kunjungan;

  @Column({ nullable: true })
  dokter_user_id?: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'dokter_user_id' })
  dokter?: User;

  @Column({ nullable: true })
  apoteker_user_id?: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'apoteker_user_id' })
  apoteker?: User;

  @Column({ length: 120 })
  dari_user: string;

  @Column({ length: 120, default: 'Apoteker' })
  ke_user: string;

  @Column({ type: 'text' })
  isi_pesan: string;

  @Column({ type: 'jsonb', nullable: true })
  resep_item?: Array<{
    nama_obat: string;
    aturan_pakai: string;
    jumlah: string;
  }>;

  @Column({ length: 30, default: 'menunggu' })
  status: string; // 'menunggu' | 'diproses' | 'siap_diambil' | 'diserahkan' | 'selesai'

  @CreateDateColumn({ type: 'timestamp' })
  waktu: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
