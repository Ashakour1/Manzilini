import express from 'express';
import { 
    createPropertyApplication, 
    getPropertyApplications, 
    getPropertyApplicationById, 
    updatePropertyApplication, 
    deletePropertyApplication, 
    getPropertyApplicationsByTenant,
    getPropertyApplicationsByLandlord
} from '../controllers/property.applications.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Create property application (public endpoint)
router.post('/', createPropertyApplication);

// Get all property applications with optional filters (query params: propertyId, landlordId, status)
router.get('/', AuthMiddleware, getPropertyApplications);

// Get property applications by landlord
router.get('/landlord/:landlordId', AuthMiddleware, getPropertyApplicationsByLandlord);

// Get property applications by tenant (query params: email, phone)
router.get('/tenant', AuthMiddleware, getPropertyApplicationsByTenant);

// Get single property application by ID
router.get('/:id', AuthMiddleware, getPropertyApplicationById);

// Update property application
router.put('/:id', AuthMiddleware, updatePropertyApplication);

// Delete property application
router.delete('/:id', AuthMiddleware, deletePropertyApplication);

export default router;
