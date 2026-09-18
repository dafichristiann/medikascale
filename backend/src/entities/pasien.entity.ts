import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('pasien')
export class Pasien {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30, unique: true })
  no_rm: string;

  @Column({ length: 120 })
  nama: string;

  @Column({ type: 'date' })
  tanggal_lahir: string;

  @Column({ length: 20 })
  jenis_kelamin: string;

  @Column({ length: 120, nullable: true })
  nama_wali: string;

  @Column({ length: 5, nullable: true })
  golongan_darah: string;

  @Column({ length: 20, nullable: true })
  no_telepon: string;

  @Column({ type: 'text', nullable: true })
  alamat: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
