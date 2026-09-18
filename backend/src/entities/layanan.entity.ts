import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('layanan')
export class Layanan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 80 })
  nama: string;

  @Column({ default: true })
  aktif: boolean;
}
