import { Router } from 'express';
import { authMiddleware, permissionMiddleware } from '../middleware/auth.js';
import * as pasienController from '../controllers/pasienController.js';
const router = Router();
router.get('/:id', authMiddleware, permissionMiddleware('antrian.view'), pasienController.getPasienDetail);
router.get('/:pasien_id/kunjungan', authMiddleware, permissionMiddleware('antrian.view'), pasienController.getKunjunganByPasien);
export default router;
//# sourceMappingURL=pasienRoutes.js.map