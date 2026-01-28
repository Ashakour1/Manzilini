import express from 'express';
import { getProperties, getPropertyById, createProperty, updateProperty, deleteProperty, getPropertyTypes, getPropertyCountsByCity, getPropertiesForUser } from '../controllers/property.controller.js';
import upload from '../middlewares/upload.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/types', getPropertyTypes);
router.get('/cities/counts', getPropertyCountsByCity);

router.get('/', getProperties);

router.get('/specific', AuthMiddleware, getPropertiesForUser);

// Agent-specific endpoint for properties
router.get('/agent', AuthMiddleware, getPropertiesForUser);

router.get('/:id', getPropertyById);

// Use memory upload + Cloudinary for property images
router.post("/", AuthMiddleware, upload.array("images", 10), createProperty);

// Allow updating with optional new images (uploaded to Cloudinary)
router.put('/:id', AuthMiddleware, upload.array("images", 10), updateProperty);

router.delete('/:id', AuthMiddleware, deleteProperty);

export default router;