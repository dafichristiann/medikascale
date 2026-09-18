import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { ArsipMap } from './arsip-map.entity';

@Entity('arsip_lokasi')
@Unique(['lantai', 'ruang', 'rak', 'baris'])
export class ArsipLokasi {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 50 }) lantai: string;
  @Column({ length: 50 }) ruang: string;
  @Column({ length: 50 }) rak: string;
  @Column({ length: 50 }) baris: string;
  @Column({ type: 'text', nullable: true }) keterangan: string | null;
  @Column({ default: true }) aktif: boolean;
  @Column({ type: 'int', nullable: true }) created_by_user_id: number | null;
  @CreateDateColumn({ type: 'timestamp' }) created_at: Date;
  @OneToMany(() => ArsipMap, (map) => map.lokasi) maps: ArsipMap[];
}
