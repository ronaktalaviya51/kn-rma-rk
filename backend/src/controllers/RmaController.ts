import { Request, Response } from 'express';
import { db } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { EmailService } from '../services/EmailService';
import { AuthRequest } from '../middleware/auth';
import moment from 'moment';

export class RmaController {
  private emailService = new EmailService();

  constructor() {
    // Bind methods to preserve "this" context in Express
    this.createRequest = this.createRequest.bind(this);
    this.getRequestStatus = this.getRequestStatus.bind(this);
    this.getAllRequests = this.getAllRequests.bind(this);
    this.getRequestById = this.getRequestById.bind(this);
    this.updateRequestStatus = this.updateRequestStatus.bind(this);
    this.deleteRequest = this.deleteRequest.bind(this);
    this.getStats = this.getStats.bind(this);
  }

  async createRequest(req: Request, res: Response) {
    const requestData = req.body;

    // Generate RMA number
    const rmaNumber = await this.generateRmaNumber();

    const result = await db.query(
      `INSERT INTO rma_requests (
        rma_number, customer_name, customer_email, customer_phone,
        order_number, po_number, product_name, product_model, serial_number, 
        quantity, purchase_date, purchase_location, tracking_number,
        issue_description, return_reason
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        rmaNumber,
        requestData.customer_name,
        requestData.customer_email,
        requestData.customer_phone,
        requestData.order_number,
        requestData.po_number,
        requestData.product_name,
        requestData.product_model,
        requestData.serial_number,
        requestData.quantity || 1,
        requestData.purchase_date,
        requestData.purchase_location,
        requestData.tracking_number,
        requestData.issue_description,
        requestData.return_reason,
      ]
    );

    const requestId = result.insertId;

    // Send confirmation email
    await this.emailService.sendRmaConfirmation(requestData.customer_email, {
      rmaNumber,
      customerName: requestData.customer_name,
      productName: requestData.product_name,
    });

    logger.info(
      `RMA request created: ${rmaNumber} for ${requestData.customer_name}`
    );

    res.status(201).json({
      success: true,
      message: "RMA request created successfully",
      rmaNumber,
      requestId,
    });
  }

  async getRequestStatus(req: Request, res: Response) {
    const { rmaNumber } = req.params;

    const requests = await db.query(
      `SELECT rma_number, status, created_at, updated_at, processed_at, admin_notes, customer_name, product_name
       FROM rma_requests WHERE rma_number = ?`,
      [rmaNumber]
    );

    if (requests.length === 0) {
      throw createError("RMA request not found", 404);
    }

    res.json({
      success: true,
      data: requests[0],
    });
  }

  async getAllRequests(req: Request, res: Response) {
    const { page = 1, limit = 10, status, priority, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereConditions: string[] = [];
    let params: any[] = [];

    if (status) {
      whereConditions.push("status = ?");
      params.push(status);
    }

    if (priority) {
      whereConditions.push("priority = ?");
      params.push(priority);
    }

    if (search) {
      whereConditions.push(
        "(customer_name LIKE ? OR customer_email LIKE ? OR rma_number LIKE ?)"
      );
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    // count query
    const countQuery = `SELECT COUNT(*) as total FROM rma_requests ${whereClause}`;
    const totalResult = await db.query(countQuery, params);
    const total = totalResult[0].total;

    // Inline limit/offset values directly
    const dataQuery = `
    SELECT r.*, u.username as processed_by_username
    FROM rma_requests r
    LEFT JOIN users u ON r.processed_by = u.id
    ${whereClause}
    ORDER BY r.created_at DESC
    LIMIT ${Number(limit)} OFFSET ${offset}
  `;

    const requests = await db.query(dataQuery, params);

    res.json({
      success: true,
      data: requests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  }

  async getRequestById(req: Request, res: Response) {
    const { id } = req.params;

    const requests = await db.query(
      `SELECT r.*, u.username as processed_by_username
        FROM rma_requests r
        LEFT JOIN users u ON r.processed_by = u.id
        WHERE r.id = ?`,
      [id]
    );

    if (requests.length === 0) {
      throw createError("RMA request not found", 404);
    }

    // Get uploaded files
    const files = await db.query(
      "SELECT * FROM file_uploads WHERE rma_request_id = ?",
      [id]
    );

    res.json({
      success: true,
      data: {
        ...requests[0],
        files,
      },
    });
  }

  async updateRequestStatus(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { status, admin_notes, priority } = req.body;
    const userId = req.user?.id ?? null;

    // Check if request exists
    const existingRequests = await db.query(
      "SELECT * FROM rma_requests WHERE id = ?",
      [id]
    );

    if (existingRequests.length === 0) {
      throw createError("RMA request not found", 404);
    }

    const existingRequest = existingRequests[0];

    // Update request
    await db.query(
      `UPDATE rma_requests 
       SET status = ?, admin_notes = ?, priority = ?, processed_by = ?, processed_at = NOW()
       WHERE id = ?`,
      [status ?? null, admin_notes ?? null, priority ?? null, userId ?? null, id ?? null]
    );

    // Send status update email
    await this.emailService.sendStatusUpdate(existingRequest.customer_email, {
      rmaNumber: existingRequest.rma_number,
      customerName: existingRequest.customer_name,
      status,
      adminNotes: admin_notes,
    });

    logger.info(
      `RMA request ${existingRequest.rma_number} status updated to ${status} by user ${userId}`
    );

    res.json({
      success: true,
      message: "RMA request status updated successfully",
    });
  }

  async deleteRequest(req: Request, res: Response) {
    const { id } = req.params;

    const result = await db.query("DELETE FROM rma_requests WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      throw createError("RMA request not found", 404);
    }

    res.json({
      success: true,
      message: "RMA request deleted successfully",
    });
  }

  async getStats(_req: Request, res: Response) {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_requests,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_requests,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_requests,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_requests,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as requests_this_week,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as requests_this_month
      FROM rma_requests
    `;

    const stats = await db.query(statsQuery);

    res.json({
      success: true,
      data: stats[0],
    });
  }

  private async generateRmaNumber(): Promise<string> {
    const prefix = "KN-RMA-";
    const timestamp = moment().format("YYYYMMDD");

    // Get today's count
    const countResult = await db.query(
      `SELECT COUNT(*) as count FROM rma_requests 
       WHERE DATE(created_at) = CURDATE()`
    );

    const todayCount = countResult[0].count + 1;
    const sequence = todayCount.toString().padStart(3, "0");

    return `${prefix}${timestamp}-${sequence}`;
  }
}