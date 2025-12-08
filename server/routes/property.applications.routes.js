import express from 'express';
import { createPropertyApplication, getPropertyApplications, getPropertyApplicationById, updatePropertyApplication, deletePropertyApplication, getPropertyApplicationsByTenant } from '../controllers/property.applications.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();


router.post('/',createPropertyApplication);

router.get('/', AuthMiddleware,getPropertyApplications);

router.get('/:id',AuthMiddleware, getPropertyApplicationById);

router.put('/:id',AuthMiddleware, updatePropertyApplication);

router.delete('/:id',AuthMiddleware, deletePropertyApplication);

router.get('/tenant/:tenantId', AuthMiddleware,getPropertyApplicationsByTenant);

export default router;
