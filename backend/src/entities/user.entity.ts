import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  role_id: number;

  @ManyToOne(() => Role, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ length: 120 })
  nama: string;

  @Column({ length: 60, unique: true })
  username: string;

  @Column({ length: 120, unique: true, nullable: true })
  email: string;

  @Column({ length: 255 })
  password_hash: string;

  @Column({ length: 20, nullable: true })
  no_telepon: string;

  @Column({ default: true })
  aktif: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
