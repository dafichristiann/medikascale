import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('notifikasi')
export class Notifikasi {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  user_id?: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ length: 30, nullable: true })
  role_kode?: string;

  @Column({ length: 120 })
  judul: string;

  @Column({ type: 'text' })
  pesan: string;

  @Column({ length: 30 })
  tipe: string; // 'resep' | 'lab' | 'arsip' | 'antrian' | 'sistem'

  @Column({ length: 120, nullable: true })
  tautan?: string;

  @Column({ default: false })
  dibaca: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
