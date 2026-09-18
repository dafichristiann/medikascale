import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Kunjungan } from './kunjungan.entity';
import { User } from './user.entity';

@Entity('pemeriksaan_dokter')
export class PemeriksaanDokter {
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

  @Column({ type: 'text', nullable: true })
  keluhan?: string;

  @Column({ type: 'text', nullable: true })
  pemeriksaan_fisik?: string;

  @Column({ length: 255 })
  diagnosis: string;

  @Column({ type: 'text', nullable: true })
  catatan_terapi?: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
