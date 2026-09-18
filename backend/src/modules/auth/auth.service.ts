import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { username },
      relations: { role: { permissions: true } },
    });

    if (!user || !user.aktif) {
      throw new UnauthorizedException('Username atau password salah.');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Username atau password salah.');
    }

    const permissions = (user.role?.permissions || []).map((p) => p.kode);

    const payload = {
      sub: user.id,
      username: user.username,
      role_id: user.role_id,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        nama: user.nama,
        username: user.username,
        role: {
          id: user.role.id,
          kode: user.role.kode,
          nama_tampil: user.role.nama_tampil,
        },
        permissions,
      },
    };
  }
}
