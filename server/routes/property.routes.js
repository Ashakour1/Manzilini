import express from 'express';
import { getProperties, getPropertyById, createProperty, updateProperty, deleteProperty, getPropertyTypes, getPropertyCountsByCity, getPropertiesForUser } from '../controllers/property.controller.js';
import { upload } from '../config/multer.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/types', getPropertyTypes);
router.get('/cities/counts', getPropertyCountsByCity);

router.get('/', getProperties);

router.get('/specific', AuthMiddleware, getPropertiesForUser);

router.get('/:id', getPropertyById);

router.post("/",AuthMiddleware, upload.array("images", 10), createProperty);

router.put('/:id',AuthMiddleware, updateProperty);

router.delete('/:id',AuthMiddleware, deleteProperty);

export default router;