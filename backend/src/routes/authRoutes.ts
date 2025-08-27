import express from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateRequest, loginSchema } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();
const authController = new AuthController();

// Login
router.post('/login', validateRequest(loginSchema), asyncHandler(authController.login));

// Verify token
router.get('/verify', asyncHandler(authController.verifyToken));

// Logout
router.post('/logout', asyncHandler(authController.logout));

export default router;