import express from 'express';
import { 
    getTenants, 
    getTenantById, 
    createTenant, 
    updateTenant, 
    deleteTenant,
    getTenantActivities
} from '../controllers/tenant.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Get all tenants
router.get('/', AuthMiddleware, getTenants);

// Get tenant by ID
router.get('/:id', AuthMiddleware, getTenantById);

// Get tenant activities
router.get('/:id/activities', AuthMiddleware, getTenantActivities);

// Create tenant
router.post('/', AuthMiddleware, createTenant);

// Update tenant
router.put('/:id', AuthMiddleware, updateTenant);

// Delete tenant
router.delete('/:id', AuthMiddleware, deleteTenant);

export default router;
