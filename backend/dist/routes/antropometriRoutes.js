import { Router } from 'express';
import { authMiddleware, permissionMiddleware } from '../middleware/auth.js';
import * as antropometriController from '../controllers/antropometriController.js';
const router = Router();
router.post('/', authMiddleware, permissionMiddleware('antropometri.input'), antropometriController.createAntropometri);
router.get('/pasien/:pasien_id', authMiddleware, permissionMiddleware('antropometri.view'), antropometriController.getAntropometriByPasien);
router.get('/report', authMiddleware, permissionMiddleware('antropometri.view'), antropometriController.getAntropometriReport);
export default router;
//# sourceMappingURL=antropometriRoutes.js.map