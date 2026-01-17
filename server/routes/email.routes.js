import express from 'express';
import { 
    sendManualEmail, 
    sendEmailToLandlord, 
    sendEmailToUser 
} from '../controllers/email.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All email routes require authentication
router.post('/send', AuthMiddleware, sendManualEmail);
router.post('/landlord/:id', AuthMiddleware, sendEmailToLandlord);
router.post('/user/:id', AuthMiddleware, sendEmailToUser);

export default router;
