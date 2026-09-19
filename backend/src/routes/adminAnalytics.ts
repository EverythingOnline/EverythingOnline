import { Router } from 'express';
import requireAdminAuth from '../middleware/adminAuth.js';
import { getLowStock, getOutOfStock, getRevenue, getTopSelling } from '../controllers/adminAnalyticsController.js';

const router = Router();
router.use(requireAdminAuth);
router.get('/low-stock', getLowStock);
router.get('/out-of-stock', getOutOfStock);
router.get('/top-selling', getTopSelling);
router.get('/revenue', getRevenue);

export default router;