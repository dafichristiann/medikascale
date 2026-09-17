import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import * as authService from '../services/authService.js';
import Joi from 'joi';

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string(),
  token: Joi.string(),
}).or('refreshToken', 'token');

export async function handleLogin(req: AuthRequest, res: Response) {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const result = await authService.login(value.username, value.password);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ message: 'Username atau password salah', code: 'INVALID_CREDENTIALS' });
  }
}

export async function handleRefresh(req: AuthRequest, res: Response) {
  try {
    const { error, value } = refreshSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message, code: 'VALIDATION_ERROR' });
    }

    const result = await authService.refreshAccessToken(value.refreshToken ?? value.token);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ message: 'Refresh token tidak valid', code: 'INVALID_REFRESH_TOKEN' });
  }
}
