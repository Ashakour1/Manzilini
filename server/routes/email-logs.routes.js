import express from 'express';
import { 
    getEmailLogs, 
    getEmailLogById, 
    getEmailLogsByLandlord,
    getEmailStats
} from '../controllers/email-logs.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All email log routes require authentication
router.get('/stats', AuthMiddleware, getEmailStats);
router.get('/landlord/:landlordId', AuthMiddleware, getEmailLogsByLandlord);
router.get('/:id', AuthMiddleware, getEmailLogById);
router.get('/', AuthMiddleware, getEmailLogs);

export default router;
