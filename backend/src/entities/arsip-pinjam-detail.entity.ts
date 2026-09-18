import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ArsipPinjam } from './arsip-pinjam.entity';

@Entity('arsip_pinjam_detail')
export class ArsipPinjamDetail {
  @PrimaryGeneratedColumn() id: number;
  @Column() pinjam_id: number;
  @ManyToOne(() => ArsipPinjam, (pinjam) => pinjam.detail, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'pinjam_id' }) pinjam: ArsipPinjam;
  @Column({ type: 'varchar', length: 50, nullable: true }) nomor_dokumen: string | null;
  @Column({ length: 120 }) nama_dokumen: string;
  @Column({ type: 'text', nullable: true }) keterangan: string | null;
  @CreateDateColumn({ type: 'timestamp' }) created_at: Date;
}
