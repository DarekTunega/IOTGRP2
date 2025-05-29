import express from 'express';
import { addCO2Reading, getRecentReadings, receiveGatewayData } from '../controllers/reading.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authMiddleware, addCO2Reading);
router.get('/:deviceId', authMiddleware, getRecentReadings);
router.post('/gateway', receiveGatewayData);

export default router;
