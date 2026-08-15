import { Router } from 'express';
import { initiateMpesa, mpesaCallback, manualPaymentHandler, getPaymentStatus } from '../controllers/checkoutController.js';
import validateMpesaRequest from '../middleware/validateMpesaRequest.js';

const router = Router();

router.post('/mpesa/initiate', validateMpesaRequest, initiateMpesa);
router.post('/mpesa/callback', mpesaCallback);
router.post('/manual', manualPaymentHandler);
router.get('/status/:checkoutRequestId', getPaymentStatus);

export default router;
