import express from 'express';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';
import {
  getMaintenanceRequests,
  getMaintenanceRequestById,
  createMaintenanceRequest,
  updateMaintenanceRequest,
  deleteMaintenanceRequest,
} from '../controllers/maintenance.controller.js';

const router = express.Router();

router.get('/', AuthMiddleware, getMaintenanceRequests);
router.get('/:id', AuthMiddleware, getMaintenanceRequestById);
router.post('/', AuthMiddleware, createMaintenanceRequest);
router.patch('/:id', AuthMiddleware, updateMaintenanceRequest);
router.delete('/:id', AuthMiddleware, deleteMaintenanceRequest);

export default router;
