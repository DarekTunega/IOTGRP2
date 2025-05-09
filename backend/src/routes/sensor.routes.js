import express from 'express';
import { addSensor, getSensorsByBuilding, updateBatteryLevel } from '../controllers/sensor.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authMiddleware, addSensor);
router.get('/:buildingId', authMiddleware, getSensorsByBuilding);
router.patch('/:id/battery', authMiddleware, updateBatteryLevel);

export default router;
