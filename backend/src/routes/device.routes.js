import express from 'express';
import {
  getDevices,
  getDeviceById,
  createDevice,
  updateDevice,
  deleteDevice
} from '../controllers/device.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authMiddleware, getDevices);
router.get('/:id', authMiddleware, getDeviceById);
router.post('/', authMiddleware, createDevice);
router.patch('/:id', authMiddleware, updateDevice);
router.delete('/:id', authMiddleware, deleteDevice);

export default router;
