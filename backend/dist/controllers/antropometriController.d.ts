import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
export declare function createAntropometri(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getAntropometriByPasien(req: AuthRequest, res: Response): Promise<void>;
export declare function getAntropometriReport(req: AuthRequest, res: Response): Promise<void>;
