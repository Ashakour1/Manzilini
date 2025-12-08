import express from 'express';
import { 
    registerLandlord, 
    getLandlords, 
    getLandlordById, 
    updateLandlord, 
    deleteLandlord 
} from '../controllers/landlord.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', AuthMiddleware, registerLandlord);
router.get('/', getLandlords);
router.get('/:id', getLandlordById);
router.put('/:id', AuthMiddleware, updateLandlord);
router.delete('/:id', AuthMiddleware, deleteLandlord);

export default router;
