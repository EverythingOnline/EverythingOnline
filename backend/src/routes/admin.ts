import { Router } from 'express';
import { listPayments } from '../controllers/adminController.js';
import { listPendingPayments, approvePayment, rejectPayment } from '../controllers/adminPaymentsController.js';
import requireAdminAuth from '../middleware/adminAuth.js';

const router = Router();

router.use(requireAdminAuth);

router.get('/payments', listPayments);
router.get('/payments/pending', listPendingPayments);
router.post('/payments/:id/approve', approvePayment);
router.post('/payments/:id/reject', rejectPayment);

export default router;
