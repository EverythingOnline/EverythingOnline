import { Router } from 'express';
import { listOrders, getOrder, updateOrderStatusHandler, recordManualPaymentHandler, finalizeOrderCheckoutHandler } from '../controllers/adminOrdersController.js';
import requireAdminAuth from '../middleware/adminAuth.js';

const router = Router();
router.use(requireAdminAuth);

router.get('/', listOrders);
router.get('/:id', getOrder);
router.patch('/:id/status', updateOrderStatusHandler);
router.post('/:id/manual-payment', recordManualPaymentHandler);
router.post('/:id/finalize-checkout', finalizeOrderCheckoutHandler);

export default router;
