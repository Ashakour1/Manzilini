import express from 'express';
import { getProperties, getPropertyById, createProperty, updateProperty, deleteProperty } from '../controllers/property.controller.js';

const router = express.Router();

router.get('/', getProperties);

router.get('/:id', getPropertyById);

router.post('/', createProperty);

router.put('/:id', updateProperty);

router.delete('/:id', deleteProperty);

export default router;