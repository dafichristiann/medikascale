import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, Role, Permission } from '../../entities';
import {
  CreateUserDto,
  UpdateUserRoleDto,
  UpdateUserStatusDto,
  UpdateRolePermissionsDto,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async findAllUsers() {
    const users = await this.userRepository.find({
      relations: { role: true },
      order: { id: 'ASC' },
    });
    return users.map((u) => {
      const { password_hash, ...rest } = u;
      return rest;
    });
  }

  async createUser(dto: CreateUserDto) {
    const existingUsername = await this.userRepository.findOne({
      where: { username: dto.username },
    });
    if (existingUsername) {
      throw new ConflictException(`Username '${dto.username}' sudah digunakan`);
    }

    if (dto.email) {
      const existingEmail = await this.userRepository.findOne({
        where: { email: dto.email },
      });
      if (existingEmail) {
        throw new ConflictException(`Email '${dto.email}' sudah digunakan`);
      }
    }

    const role = await this.roleRepository.findOne({
      where: { id: dto.role_id },
    });
    if (!role) {
      throw new NotFoundException(`Role #${dto.role_id} tidak ditemukan`);
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.userRepository.create({
      nama: dto.nama,
      username: dto.username,
      email: dto.email,
      password_hash: passwordHash,
      role_id: dto.role_id,
      no_telepon: dto.no_telepon,
      aktif: true,
    });

    const saved = await this.userRepository.save(user);
    const { password_hash, ...result } = saved;
    return result;
  }

  async updateUserStatus(id: number, aktif: boolean, currentUserId?: number) {
    if (id === currentUserId && !aktif) {
      throw new BadRequestException('Anda tidak dapat menonaktifkan akun sendiri');
    }

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User #${id} tidak ditemukan`);
    }

    user.aktif = aktif;
    await this.userRepository.save(user);

    const { password_hash, ...result } = user;
    return result;
  }

  async updateUserRole(id: number, dto: UpdateUserRoleDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User #${id} tidak ditemukan`);
    }

    const role = await this.roleRepository.findOne({ where: { id: dto.role_id } });
    if (!role) {
      throw new NotFoundException(`Role #${dto.role_id} tidak ditemukan`);
    }

    user.role_id = dto.role_id;
    await this.userRepository.save(user);

    return this.userRepository.findOne({
      where: { id },
      relations: { role: true },
      select: {
        id: true,
        nama: true,
        username: true,
        email: true,
        aktif: true,
        role_id: true,
        role: true,
        created_at: true,
      },
    });
  }

  async findAllRoles() {
    return this.roleRepository.find({
      relations: { permissions: true },
      order: { id: 'ASC' },
    });
  }

  async findAllPermissions() {
    return this.permissionRepository.find({
      order: { modul: 'ASC', id: 'ASC' },
    });
  }

  async updateRolePermissions(roleId: number, dto: UpdateRolePermissionsDto) {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: { permissions: true },
    });
    if (!role) {
      throw new NotFoundException(`Role #${roleId} tidak ditemukan`);
    }

    // Role admin must retain admin.kelola
    if (role.kode === 'admin') {
      const adminKelolaPerm = await this.permissionRepository.findOne({
        where: { kode: 'admin.kelola' },
      });
      if (adminKelolaPerm && !dto.permission_ids.includes(adminKelolaPerm.id)) {
        dto.permission_ids.push(adminKelolaPerm.id);
      }
    }

    const permissions = await this.permissionRepository.findBy({
      id: In(dto.permission_ids),
    });

    role.permissions = permissions;
    await this.roleRepository.save(role);

    return this.roleRepository.findOne({
      where: { id: roleId },
      relations: { permissions: true },
    });
  }
}
