import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  PERMISSIONS_KEY,
  PERMISSIONS_ANY_KEY,
} from '../decorators/require-permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredAll = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiredAny = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_ANY_KEY,
      [context.getHandler(), context.getClass()],
    );

    const hasAllCheck = Boolean(requiredAll && requiredAll.length > 0);
    const hasAnyCheck = Boolean(requiredAny && requiredAny.length > 0);

    if (!hasAllCheck && !hasAnyCheck) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.permissions || !Array.isArray(user.permissions)) {
      throw new ForbiddenException('Akses ditolak: Anda tidak memiliki izin yang diperlukan.');
    }

    if (hasAllCheck) {
      const satisfiesAll = requiredAll!.every((perm) =>
        user.permissions.includes(perm),
      );
      if (!satisfiesAll) {
        throw new ForbiddenException(
          `Akses ditolak: Membutuhkan izin [${requiredAll!.join(', ')}]`,
        );
      }
    }

    if (hasAnyCheck) {
      const satisfiesAny = requiredAny!.some((perm) =>
        user.permissions.includes(perm),
      );
      if (!satisfiesAny) {
        throw new ForbiddenException(
          `Akses ditolak: Membutuhkan salah satu izin dari [${requiredAny!.join(', ')}]`,
        );
      }
    }

    return true;
  }
}
