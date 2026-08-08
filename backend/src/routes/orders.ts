import { Router } from 'express';
import { createOrder, createBulkOrders } from '../controllers/ordersController.js';
import validateOrder from '../middleware/validateOrder.js';

const router = Router();

router.post('/', validateOrder, createOrder);
router.post('/bulk', createBulkOrders);

export default router;
