import { Router } from 'express';
import { authMiddleware, permissionMiddleware } from '../middleware/auth.js';
import * as aantrianController from '../controllers/aantrianController.js';
const router = Router();
router.get('/', authMiddleware, permissionMiddleware('antrian.view'), aantrianController.getKunjunganList);
router.get('/log/:kunjungan_id', authMiddleware, permissionMiddleware('antrian.view'), aantrianController.getAantrianLog);
router.get('/:id', authMiddleware, permissionMiddleware('antrian.view'), aantrianController.getKunjunganDetail);
router.put('/:id/status', authMiddleware, permissionMiddleware('antrian.update_status'), aantrianController.updateKunjunganStatus);
export default router;
//# sourceMappingURL=aantrianRoutes.js.map