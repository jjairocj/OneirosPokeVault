import { Router } from 'express';
import { register, login, refresh, logout } from '../controllers/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(authLimiter);

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;
