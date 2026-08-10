import { Router } from 'express';
import { createOrder, createBulkOrders } from '../controllers/ordersController.js';
import validateOrder from '../middleware/validateOrder.js';
import validateBulkOrder from '../middleware/validateBulkOrder.js';

const router = Router();

router.post('/', validateOrder, createOrder);
router.post('/bulk', validateBulkOrder, createBulkOrders);

export default router;
