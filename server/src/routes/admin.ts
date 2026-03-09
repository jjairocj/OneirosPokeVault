import { Router } from 'express';
import { authGuard } from '../middleware/authGuard';
import { adminGuard } from '../middleware/adminGuard';
import { listUsers, updateUserPlan } from '../controllers/admin';

const router = Router();

router.use(authGuard as any);
router.use(adminGuard as any);

router.get('/users', listUsers as any);
router.patch('/users/:id/plan', updateUserPlan as any);

export default router;
