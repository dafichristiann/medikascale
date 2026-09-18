import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Pasien } from './pasien.entity';
import { ArsipLokasi } from './arsip-lokasi.entity';
import { ArsipPinjam } from './arsip-pinjam.entity';

@Entity('arsip_map')
export class ArsipMap {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 50, unique: true }) nomor_map: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) nomor_dokumen: string | null;
  @Column() pasien_id: number;
  @ManyToOne(() => Pasien, { eager: true }) @JoinColumn({ name: 'pasien_id' }) pasien: Pasien;
  @Column({ type: 'int', nullable: true }) lokasi_id: number | null;
  @ManyToOne(() => ArsipLokasi, (lokasi) => lokasi.maps, { eager: true, nullable: true }) @JoinColumn({ name: 'lokasi_id' }) lokasi: ArsipLokasi | null;
  @Column({ length: 20, default: 'tersedia' }) status: 'tersedia' | 'dipinjam' | 'dikembalikan';
  @CreateDateColumn({ type: 'timestamp' }) created_at: Date;
  @UpdateDateColumn({ type: 'timestamp' }) updated_at: Date;
  @OneToMany(() => ArsipPinjam, (pinjam) => pinjam.map) peminjaman: ArsipPinjam[];
}
