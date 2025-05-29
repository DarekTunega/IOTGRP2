import express from 'express';
import { getNotifications } from '../controllers/notification.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authMiddleware, getNotifications);

export default router;
