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

@Entity('antrian_log')
export class AntrianLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  kunjungan_id: number;

  @ManyToOne(() => Kunjungan)
  @JoinColumn({ name: 'kunjungan_id' })
  kunjungan: Kunjungan;

  @Column({ type: 'varchar', length: 10, nullable: true })
  status_dari: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  status_ke: string | null;

  @Column({ type: 'int', nullable: true })
  diubah_oleh_user_id: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'diubah_oleh_user_id' })
  diubah_oleh: User | null;

  @CreateDateColumn({ type: 'timestamp' })
  waktu: Date;
}
