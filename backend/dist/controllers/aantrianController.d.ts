import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
export declare function getKunjunganList(req: AuthRequest, res: Response): Promise<void>;
export declare function getKunjunganDetail(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function updateKunjunganStatus(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getAantrianLog(req: AuthRequest, res: Response): Promise<void>;
