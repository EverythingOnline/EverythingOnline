import { Router } from 'express';
import {
    createProduct,
    deleteProductHandler,
    listOrders,
    listPayments,
    listProducts,
    updateProductHandler,
} from '../controllers/adminController.js';

const router = Router();

router.get('/products', listProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProductHandler);
router.delete('/products/:id', deleteProductHandler);
router.get('/orders', listOrders);
router.get('/payments', listPayments);

export default router;
