import express from 'express';
import { getProperties, getPropertyById, createProperty, updateProperty, deleteProperty } from '../controllers/property.controller.js';
import { upload } from '../config/multer.js';

const router = express.Router();

router.get('/', getProperties);

router.get('/:id', getPropertyById);

router.post("/", upload.array("images", 10), createProperty);

router.put('/:id', updateProperty);

router.delete('/:id', deleteProperty);

export default router;