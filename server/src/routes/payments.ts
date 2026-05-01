import { Router } from 'express';
import { authGuard } from '../middleware/authGuard.js';
import { initiatePayment, getPaymentStatus, handleWebhook } from '../controllers/payments/index.js';

const router = Router();

// Webhook no necesita auth (viene de Bold/Stripe directamente)
router.post('/webhook', handleWebhook as any);

router.use(authGuard as any);

router.post('/initiate', initiatePayment as any);
router.get('/:id', getPaymentStatus as any);

export default router;
