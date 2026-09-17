import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
export declare function getPasienDetail(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getKunjunganByPasien(req: AuthRequest, res: Response): Promise<void>;
