import express from 'express';
import { 
    registerLandlord, 
    getLandlords, 
    getLandlordById, 
    updateLandlord, 
    deleteLandlord,
    verifyLandlord,
    getLandlordsForAgent
} from '../controllers/landlord.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public route for landlord registration (no auth required)
router.post('/register', registerLandlord);
// Admin route for landlord registration (auth required)
router.post('/', AuthMiddleware, registerLandlord);
router.get('/', getLandlords);
// Agent-specific endpoint for landlords
router.get('/agent', AuthMiddleware, getLandlordsForAgent);
router.get('/:id', getLandlordById);
router.put('/:id', AuthMiddleware, updateLandlord);
router.patch('/:id/verify', AuthMiddleware, verifyLandlord);
router.delete('/:id', AuthMiddleware, deleteLandlord);

export default router;
