import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { ArsipMap } from './arsip-map.entity';
import { ArsipPinjamDetail } from './arsip-pinjam-detail.entity';

@Entity('arsip_pinjam')
export class ArsipPinjam {
  @PrimaryGeneratedColumn() id: number;
  @Column() map_id: number;
  @ManyToOne(() => ArsipMap, (map) => map.peminjaman, { eager: true }) @JoinColumn({ name: 'map_id' }) map: ArsipMap;
  @Column() peminjam_user_id: number;
  @ManyToOne(() => User, { eager: true }) @JoinColumn({ name: 'peminjam_user_id' }) peminjam: User;
  @Column({ type: 'timestamptz' }) tanggal_pinjam: Date;
  @Column({ type: 'timestamptz', nullable: true }) tanggal_kembali: Date | null;
  @Column({ length: 20, default: 'dipinjam' }) status: 'dipinjam' | 'dikembalikan';
  @Column({ type: 'text' }) keterangan: string;
  @CreateDateColumn({ type: 'timestamp' }) created_at: Date;
  @UpdateDateColumn({ type: 'timestamp' }) updated_at: Date;
  @OneToMany(() => ArsipPinjamDetail, (detail) => detail.pinjam) detail: ArsipPinjamDetail[];
}
