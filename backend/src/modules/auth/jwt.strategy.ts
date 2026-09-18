import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'medikascale_jwt_secret_key_2026_super_secure'),
    });
  }

  async validate(payload: { sub: number; username: string }) {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      relations: { role: { permissions: true } },
    });

    if (!user || !user.aktif) {
      throw new UnauthorizedException('Sesi tidak valid atau pengguna dinonaktifkan');
    }

    const permissions = (user.role?.permissions || []).map((p) => p.kode);

    return {
      id: user.id,
      nama: user.nama,
      username: user.username,
      email: user.email,
      role: {
        id: user.role.id,
        kode: user.role.kode,
        nama_tampil: user.role.nama_tampil,
      },
      permissions,
    };
  }
}
