import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Role } from './role.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 60, unique: true })
  kode: string;

  @Column({ length: 40 })
  modul: string;

  @Column({ length: 160, nullable: true })
  deskripsi: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
