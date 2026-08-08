import { Router } from 'express';
import { initiateStkPush, mpesaCallback } from '../controllers/paymentsController.js';
import validateMpesaRequest from '../middleware/validateMpesaRequest.js';

const router = Router();

router.post('/mpesa/stkpush', validateMpesaRequest, initiateStkPush);
router.post('/mpesa/callback', mpesaCallback);

export default router;
