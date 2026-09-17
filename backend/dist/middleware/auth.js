import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
export function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token tidak ditemukan', code: 'NO_TOKEN' });
    }
    try {
        const decoded = jwt.verify(token, config.jwt.secret);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Token tidak valid', code: 'INVALID_TOKEN' });
    }
}
export function permissionMiddleware(...required) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized', code: 'UNAUTHORIZED' });
        }
        const userPermissions = req.user.permissions || [];
        const hasPermission = required.some((perm) => userPermissions.includes(perm));
        if (!hasPermission) {
            return res.status(403).json({ message: 'Akses ditolak: permission tidak cukup', code: 'FORBIDDEN' });
        }
        next();
    };
}
//# sourceMappingURL=auth.js.map