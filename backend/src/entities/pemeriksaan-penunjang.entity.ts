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

@Entity('pemeriksaan_penunjang')
export class PemeriksaanPenunjang {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  kunjungan_id: number;

  @ManyToOne(() => Kunjungan)
  @JoinColumn({ name: 'kunjungan_id' })
  kunjungan: Kunjungan;

  @Column({ length: 20, default: 'lab' })
  tipe: string; // 'lab' | 'radiologi'

  @Column({ length: 120 })
  jenis_pemeriksaan: string;

  @Column({ nullable: true })
  diminta_oleh_user_id?: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'diminta_oleh_user_id' })
  diminta_oleh?: User;

  @Column({ nullable: true })
  diproses_oleh_user_id?: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'diproses_oleh_user_id' })
  diproses_oleh?: User;

  @Column({ type: 'text', nullable: true })
  catatan_dokter?: string;

  @Column({ type: 'text', nullable: true })
  hasil_pemeriksaan?: string;

  @Column({ length: 120, nullable: true })
  nilai_rujukan?: string;

  @Column({ length: 30, default: 'menunggu' })
  status: string; // 'menunggu' | 'diproses' | 'hasil_siap'

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
