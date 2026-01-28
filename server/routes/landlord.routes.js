import express from 'express';
import { 
    registerLandlord, 
    getLandlords, 
    getLandlordById, 
    updateLandlord, 
    deleteLandlord,
    verifyLandlord,
    getLandlordsForAgent,
    updateLandlordStatus,
    registerLandlordWithUser,
    uploadLandlordDocument,
} from '../controllers/landlord.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

// Public route for landlord registration (no auth required) with optional document upload
router.post('/register', upload.single('document'), registerLandlord);
router.post('/auth/register', upload.single('document'), registerLandlordWithUser);
// Admin route for landlord registration (auth required) with optional document upload
router.post('/', AuthMiddleware, upload.single('document'), registerLandlord);
router.get('/', getLandlords);
// Agent-specific endpoint for landlords
router.get('/agent', AuthMiddleware, getLandlordsForAgent);
router.get('/:id', getLandlordById);
// Allow updating landlord with optional document upload
router.put('/:id', AuthMiddleware, upload.single('document'), updateLandlord);
router.patch('/:id/verify', AuthMiddleware, verifyLandlord);
router.patch('/:id/status', AuthMiddleware, updateLandlordStatus);

// Landlord document upload (Cloudinary via memory upload)
router.post('/:id/documents', AuthMiddleware, upload.single('document'), uploadLandlordDocument);

router.delete('/:id', AuthMiddleware, deleteLandlord);

export default router;
