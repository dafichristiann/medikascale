import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Kunjungan } from './kunjungan.entity';
import { Pasien } from './pasien.entity';
import { User } from './user.entity';

@Entity('antropometri_pengukuran')
export class AntropometriPengukuran {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  kunjungan_id: number;

  @ManyToOne(() => Kunjungan)
  @JoinColumn({ name: 'kunjungan_id' })
  kunjungan: Kunjungan;

  @Column()
  pasien_id: number;

  @ManyToOne(() => Pasien)
  @JoinColumn({ name: 'pasien_id' })
  pasien: Pasien;

  @Column({ nullable: true })
  diukur_oleh_user_id?: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'diukur_oleh_user_id' })
  diukur_oleh?: User;

  @Column({ type: 'int' })
  usia_bulan: number;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  berat_badan_kg: number;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  tinggi_badan_cm: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  lingkar_kepala_cm?: number;

  @Column({ type: 'numeric', precision: 4, scale: 2, nullable: true })
  z_score_bb_u?: number;

  @Column({ type: 'numeric', precision: 4, scale: 2, nullable: true })
  z_score_tb_u?: number;

  @Column({ type: 'numeric', precision: 4, scale: 2, nullable: true })
  z_score_bb_tb?: number;

  @Column({ type: 'numeric', precision: 4, scale: 2, nullable: true })
  z_score_lk_u?: number;

  @Column({ length: 255, nullable: true })
  interpretasi?: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
