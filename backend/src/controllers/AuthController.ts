import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class AuthController {
  async login(req: Request, res: Response) {
    const { username, password } = req.body;

    const users = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username]
    );

    if (users.length === 0) {
      throw createError('Invalid credentials', 401);
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      throw createError('Invalid credentials', 401);
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );

    logger.info(`User ${user.username} logged in successfully`);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  }

  async verifyToken(req: Request, res: Response) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw createError('Access token required', 401);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret') as any;
      
      // Verify user still exists
      const users = await db.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
      
      if (users.length === 0) {
        throw createError('User not found', 401);
      }

      res.json({
        success: true,
        user: {
          id: decoded.id,
          username: decoded.username,
          email: decoded.email,
          role: decoded.role
        }
      });
    } catch (error) {
      throw createError('Invalid or expired token', 401);
    }
  }

  async logout(req: Request, res: Response) {
    res.json({
      success: true,
      message: 'Logout successful'
    });
  }
}