import { Router } from 'express';
import { initiateMpesa, mpesaCallback, manualPaymentHandler, getPaymentStatus, createCheckoutDraft, updateCheckoutShipping, updateCheckoutContact, finalizeCheckout } from '../controllers/checkoutController.js';

const router = Router();

router.post('/draft', createCheckoutDraft);
router.patch('/:orderId/shipping', updateCheckoutShipping);
router.patch('/:orderId/contact', updateCheckoutContact);
router.post('/:orderId/finalize', finalizeCheckout);

router.post('/stk-push', initiateMpesa);
router.post('/mpesa/initiate', initiateMpesa);
router.post('/mpesa-callback', mpesaCallback);
router.post('/mpesa/callback', mpesaCallback);
router.post('/manual', manualPaymentHandler);
router.get('/payment-status/:orderId', getPaymentStatus);
router.get('/status/:checkoutRequestId', getPaymentStatus);

export default router;
