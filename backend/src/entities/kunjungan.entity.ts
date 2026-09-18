import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { Pasien } from './pasien.entity';
import { Layanan } from './layanan.entity';
import { User } from './user.entity';

@Entity('kunjungan')
@Unique(['no_antrian', 'tanggal'])
export class Kunjungan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 40, unique: true })
  no_kunjungan: string;

  @Column({ type: 'int' })
  pasien_id: number;

  @ManyToOne(() => Pasien, { eager: true })
  @JoinColumn({ name: 'pasien_id' })
  pasien: Pasien;

  @Column({ type: 'int' })
  layanan_id: number;

  @ManyToOne(() => Layanan, { eager: true })
  @JoinColumn({ name: 'layanan_id' })
  layanan: Layanan;

  @Column({ type: 'int', nullable: true })
  dpjp_user_id: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'dpjp_user_id' })
  dpjp: User | null;

  @Column({ type: 'int', nullable: true })
  perawat_user_id: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'perawat_user_id' })
  perawat: User | null;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  tanggal: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  poli: string | null;

  @Column({ type: 'text', nullable: true })
  keluhan_utama: string | null;

  @Column({ type: 'varchar', length: 10 })
  no_antrian: string;

  @Column({ type: 'varchar', length: 10, default: 'putih' })
  status_antrian: string;

  @Column({ type: 'boolean', default: false })
  prioritas: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
