import express from 'express';
import { RmaController } from '../controllers/RmaController';
import { validateRequest, rmaRequestSchema, rmaStatusUpdateSchema } from '../middleware/validation';
import { authenticateToken, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();
const rmaController = new RmaController();

// Public routes
router.post('/request', validateRequest(rmaRequestSchema), asyncHandler(rmaController.createRequest));
router.get('/status/:rmaNumber', asyncHandler(rmaController.getRequestStatus));

// Admin routes
router.use(authenticateToken);
router.use(requireRole(['admin', 'manager']));

router.get('/requests', asyncHandler(rmaController.getAllRequests));
router.get('/requests/:id', asyncHandler(rmaController.getRequestById));
router.put('/requests/:id/status', validateRequest(rmaStatusUpdateSchema), asyncHandler(rmaController.updateRequestStatus));
router.delete('/requests/:id', asyncHandler(rmaController.deleteRequest));

// Statistics
router.get('/stats', asyncHandler(rmaController.getStats));

export default router;