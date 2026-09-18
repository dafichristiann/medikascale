import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Pasien } from './pasien.entity';
import { ArsipTracking } from './arsip-tracking.entity';

@Entity('arsip_dokumen')
export class ArsipDokumen {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  pasien_id: number;

  @ManyToOne(() => Pasien)
  @JoinColumn({ name: 'pasien_id' })
  pasien: Pasien;

  @Column({ length: 30 })
  no_rm: string;

  @Column({ length: 120 })
  nama_pasien: string;

  @Column({ length: 60, default: 'Gedung Utama' })
  gedung: string;

  @Column({ length: 40 })
  lantai: string;

  @Column({ length: 60 })
  ruang: string;

  @Column({ length: 60, default: 'Zona Arsip Medik' })
  area: string;

  @Column({ length: 40 })
  rak: string;

  @Column({ length: 40, default: 'Kolom 1' })
  kolom: string;

  @Column({ length: 40 })
  baris: string;

  @Column({ length: 40 })
  box: string;

  @Column({ length: 30, default: 'tersedia' })
  status: string; // 'tersedia' | 'diminta' | 'diambil' | 'dalam_pengiriman' | 'diterima' | 'dipakai' | 'dikembalikan'

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToMany(() => ArsipTracking, (t) => t.arsip)
  tracking_logs: ArsipTracking[];
}
