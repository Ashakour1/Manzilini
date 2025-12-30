import express from 'express';
import { 
    createFieldAgent,
    getFieldAgents,
    getFieldAgentById,
    updateFieldAgent,
    deleteFieldAgent
} from '../controllers/field-agents.controller.js';
import { upload } from '../config/multer.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Get all field agents (public, but you can add AuthMiddleware if needed)
router.get('/', getFieldAgents);
// Get field agent by ID
router.get('/:id', getFieldAgentById);
// Create field agent (with auth and image upload)
router.post('/', AuthMiddleware, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'document_image', maxCount: 1 }
]), createFieldAgent);
// Update field agent (with auth and image upload)
router.put('/:id', AuthMiddleware, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'document_image', maxCount: 1 }
]), updateFieldAgent);
// Delete field agent (with auth)
router.delete('/:id', AuthMiddleware, deleteFieldAgent);

export default router;



