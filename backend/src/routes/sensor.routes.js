import express from 'express';
import { addSensor, getSensorsByBuilding, updateBatteryLevel, updateSensorName } from '../controllers/sensor.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authMiddleware, addSensor, updateSensorName);
router.get('/:buildingId', authMiddleware, getSensorsByBuilding);
router.patch('/:id/battery', authMiddleware, updateBatteryLevel);
router.patch('/:id', authMiddleware, updateSensorName);

export default router;
