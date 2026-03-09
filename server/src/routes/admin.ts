import { Router } from 'express';
import { authGuard } from '../middleware/authGuard.js';
import { adminGuard } from '../middleware/adminGuard.js';
import { listUsers, updateUserPlan } from '../controllers/admin.js';

const router = Router();

router.use(authGuard as any);
router.use(adminGuard as any);

router.get('/users', listUsers as any);
router.patch('/users/:id/plan', updateUserPlan as any);

export default router;
