import pool from '../db/pool.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
export async function login(username, password) {
    const result = await pool.query(`SELECT u.id, u.username, u.password_hash, u.permissions, r.name AS role_name
     FROM users u LEFT JOIN roles r ON r.id = u.role_id
     WHERE u.username = $1`, [username]);
    if (result.rows.length === 0) {
        throw new Error('User not found');
    }
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
        throw new Error('Invalid password');
    }
    const token = jwt.sign({ id: user.id, username: user.username, role_id: user.role_name, permissions: user.permissions }, config.jwt.secret, { expiresIn: config.jwt.expiry });
    const refreshToken = jwt.sign({ id: user.id }, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiry });
    return {
        token,
        refreshToken,
        user: { id: user.id, username: user.username, role_id: user.role_name, permissions: user.permissions },
    };
}
export async function refreshAccessToken(refreshToken) {
    try {
        const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
        const result = await pool.query(`SELECT u.id, u.username, u.permissions, r.name AS role_name
       FROM users u LEFT JOIN roles r ON r.id = u.role_id
       WHERE u.id = $1`, [decoded.id]);
        if (result.rows.length === 0) {
            throw new Error('User not found');
        }
        const user = result.rows[0];
        const newToken = jwt.sign({ id: user.id, username: user.username, role_id: user.role_name, permissions: user.permissions }, config.jwt.secret, { expiresIn: config.jwt.expiry });
        return {
            token: newToken,
            user: { id: user.id, username: user.username, role_id: user.role_name, permissions: user.permissions },
        };
    }
    catch (error) {
        throw new Error('Invalid refresh token');
    }
}
//# sourceMappingURL=authService.js.map