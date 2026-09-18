import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ArsipDokumen } from './arsip-dokumen.entity';
import { User } from './user.entity';

@Entity('arsip_tracking')
export class ArsipTracking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  arsip_id: number;

  @ManyToOne(() => ArsipDokumen, (a) => a.tracking_logs)
  @JoinColumn({ name: 'arsip_id' })
  arsip: ArsipDokumen;

  @Column({ length: 120 })
  from_location: string;

  @Column({ length: 120 })
  to_location: string;

  @Column({ nullable: true })
  requested_by_user_id?: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'requested_by_user_id' })
  requested_by?: User;

  @Column({ nullable: true })
  processed_by_user_id?: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'processed_by_user_id' })
  processed_by?: User;

  @Column({ length: 30 })
  status: string;

  @Column({ type: 'text' })
  keterangan: string;

  @CreateDateColumn({ type: 'timestamp' })
  waktu: Date;
}
