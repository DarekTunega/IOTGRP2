import express from 'express';
import { createBuilding, getBuildings, deleteBuilding, getBuildingById, addDeviceToBuilding, removeDeviceFromBuilding } from '../controllers/building.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authMiddleware, createBuilding);
router.get('/', authMiddleware, getBuildings);
router.get('/:id', authMiddleware, getBuildingById);
router.delete('/:id', authMiddleware, deleteBuilding);

// Device management in buildings
router.post('/:id/devices', authMiddleware, addDeviceToBuilding);
router.delete('/:id/devices/:deviceId', authMiddleware, removeDeviceFromBuilding);

export default router;
