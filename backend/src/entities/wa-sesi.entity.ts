import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Pasien } from './pasien.entity';
import { Layanan } from './layanan.entity';

@Entity('wa_sesi')
export class WaSesi {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20 })
  no_telepon: string;

  @Column({ type: 'int', nullable: true })
  pasien_id: number | null;

  @ManyToOne(() => Pasien, { nullable: true })
  @JoinColumn({ name: 'pasien_id' })
  pasien: Pasien | null;

  @Column({ type: 'int', nullable: true })
  layanan_id_sementara: number | null;

  @ManyToOne(() => Layanan, { nullable: true })
  @JoinColumn({ name: 'layanan_id_sementara' })
  layanan: Layanan | null;

  @Column({ type: 'varchar', length: 40, default: 'AWAL' })
  state: string;

  @Column({ type: 'jsonb', nullable: true })
  konteks: Record<string, any> | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
