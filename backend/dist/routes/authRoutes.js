import { Router } from 'express';
import * as authController from '../controllers/authController.js';
const router = Router();
router.post('/login', authController.handleLogin);
router.post('/refresh', authController.handleRefresh);
export default router;
//# sourceMappingURL=authRoutes.js.map