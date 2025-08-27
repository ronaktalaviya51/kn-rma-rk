import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { createError } from './errorHandler';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return next(createError(error.details[0].message, 400));
    }
    next();
  };
};

// RMA Request validation schema
export const rmaRequestSchema = Joi.object({
  customer_name: Joi.string().min(2).max(100).required(),
  customer_email: Joi.string().email().required(),
  customer_phone: Joi.string().min(8).max(20).optional(),
  product_name: Joi.string().min(2).max(200).required(),
  product_model: Joi.string().max(100).optional(),
  serial_number: Joi.string().max(100).optional(),
  purchase_date: Joi.date().optional(),
  purchase_location: Joi.string().max(200).optional(),
  issue_description: Joi.string().min(10).max(2000).required(),
  return_reason: Joi.string().valid('defective', 'wrong_item', 'damaged', 'not_as_described', 'other').required()
});

// Login validation schema
export const loginSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(6).max(100).required()
});

// RMA status update schema
export const rmaStatusUpdateSchema = Joi.object({
  status: Joi.string().valid('pending', 'approved', 'rejected', 'additional_info_required', 'processing', 'completed').required(),
  admin_notes: Joi.string().max(2000).optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional()
});