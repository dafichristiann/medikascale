import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export interface AuthRequest extends Request {
  user?: { id: number; username: string; role_id: string; permissions: string[] };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token tidak ditemukan', code: 'NO_TOKEN' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token tidak valid', code: 'INVALID_TOKEN' });
  }
}

export function permissionMiddleware(...required: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized', code: 'UNAUTHORIZED' });
    }

    const userPermissions: string[] = req.user!.permissions || [];
    const hasPermission = required.some((perm) => userPermissions.includes(perm));
    if (!hasPermission) {
      return res.status(403).json({ message: 'Akses ditolak: permission tidak cukup', code: 'FORBIDDEN' });
    }

    next();
  };
}
