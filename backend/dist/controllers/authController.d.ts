import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
export declare function handleLogin(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function handleRefresh(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
