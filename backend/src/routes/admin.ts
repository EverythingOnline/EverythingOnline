import { Router } from 'express';
import {
    createProduct,
    deleteProductHandler,
    listOrders,
    listPayments,
    listProducts,
    updateProductHandler,
} from '../controllers/adminController.js';
import { listPendingPayments, approvePayment, rejectPayment } from '../controllers/adminPaymentsController.js';
import requireAdminAuth from '../middleware/adminAuth.js';

const router = Router();

router.use(requireAdminAuth);

router.get('/products', listProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProductHandler);
router.delete('/products/:id', deleteProductHandler);
router.get('/orders', listOrders);
router.get('/payments', listPayments);
router.get('/payments/pending', listPendingPayments);
router.post('/payments/:id/approve', approvePayment);
router.post('/payments/:id/reject', rejectPayment);

export default router;
