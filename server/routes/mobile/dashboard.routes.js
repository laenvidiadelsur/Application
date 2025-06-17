import { Router } from 'express';
import { getDashboardStats, getRecentActivities } from '../../controllers/mobile/dashboard.controller.js';

const router = Router();

router.get('/stats', getDashboardStats);
router.get('/activities', getRecentActivities);

export default router; 