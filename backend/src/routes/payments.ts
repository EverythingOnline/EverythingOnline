import { Router } from 'express';
import { initiateMpesa, mpesaCallback, manualPaymentHandler } from '../controllers/checkoutController.js';
import validateMpesaRequest from '../middleware/validateMpesaRequest.js';

const router = Router();

router.post('/mpesa/stkpush', validateMpesaRequest, initiateMpesa);
router.post('/mpesa/callback', mpesaCallback);
router.post('/manual', manualPaymentHandler);

export default router;
