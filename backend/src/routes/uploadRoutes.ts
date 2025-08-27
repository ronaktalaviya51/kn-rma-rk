import express from 'express';
import { UploadController } from '../controllers/UploadController';
import { uploadMiddleware } from '../middleware/upload';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();
const uploadController = new UploadController();

// Upload files for RMA request
router.post('/rma/:rmaId', uploadMiddleware.array('files', 5), asyncHandler(uploadController.uploadRmaFiles));

// Get file
router.get('/file/:fileId', asyncHandler(uploadController.getFile));

// Delete file (admin only)
router.delete('/file/:fileId', asyncHandler(uploadController.deleteFile));

export default router;