import { Router } from 'express';
import { authMiddleware, permissionMiddleware } from '../middleware/auth.js';
import * as authController from '../controllers/authController.js';

const router = Router();

router.post('/login', authController.handleLogin);
router.post('/refresh', authController.handleRefresh);

export default router;
