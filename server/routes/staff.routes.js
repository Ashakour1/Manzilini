import express from 'express';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';
import {
  getPortalStaff,
  getPortalStaffById,
  createPortalStaff,
  updatePortalStaff,
  deletePortalStaff
} from '../controllers/landlord-portal.controller.js';

const router = express.Router();

router.use(AuthMiddleware);

router.get('/', getPortalStaff);
router.get('/:id', getPortalStaffById);
router.post('/', createPortalStaff);
router.put('/:id', updatePortalStaff);
router.delete('/:id', deletePortalStaff);

export default router;
