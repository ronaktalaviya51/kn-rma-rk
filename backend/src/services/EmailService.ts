import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';
import { db } from '../config/database';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendRmaConfirmation(email: string, data: {
    rmaNumber: string;
    customerName: string;
    productName: string;
  }) {
    const subject = `RMA Application Confirmation - ${data.rmaNumber}`;
    const html = `
      <h2>RMA Application Confirmation</h2>
      <p>Dear ${data.customerName},</p>
      <p>Your RMA application has been successfully submitted. Details are as follows:</p>
      <ul>
        <li><strong>RMA Number:</strong> ${data.rmaNumber}</li>
        <li><strong>Product Name:</strong> ${data.productName}</li>
        <li><strong>Application Time:</strong> ${new Date().toLocaleString('en-US')}</li>
      </ul>
      <p>We will process your application as soon as possible. Please save this RMA number for tracking purposes.</p>
      <p>You can check the application status through the following link:</p>
      <p><a href="${process.env.FRONTEND_URL}/status/${data.rmaNumber}">Check RMA Status</a></p>
      <p>Thank you for your patience.</p>
      <p>KN Electronics Customer Service Team</p>
    `;

    await this.sendEmail(email, subject, html, data.rmaNumber, 'submission');
  }

  async sendStatusUpdate(email: string, data: {
    rmaNumber: string;
    customerName: string;
    status: string;
    adminNotes?: string;
  }) {
    const statusMap: { [key: string]: string } = {
      'approved': 'Approved',
      'rejected': 'Rejected',
      'additional_info_required': 'Additional Information Required',
      'processing': 'Processing',
      'completed': 'Completed'
    };

    const subject = `RMA Status Update - ${data.rmaNumber}`;
    const html = `
      <h2>RMA Status Update</h2>
      <p>Dear ${data.customerName},</p>
      <p>Your RMA application status has been updated:</p>
      <ul>
        <li><strong>RMA Number:</strong> ${data.rmaNumber}</li>
        <li><strong>Status:</strong> ${statusMap[data.status] || data.status}</li>
        <li><strong>Update Time:</strong> ${new Date().toLocaleString('en-US')}</li>
      </ul>
      ${data.adminNotes ? `<p><strong>Notes:</strong> ${data.adminNotes}</p>` : ''}
      <p>You can check the latest status through the following link:</p>
      <p><a href="${process.env.FRONTEND_URL}/status/${data.rmaNumber}">Check RMA Status</a></p>
      <p>If you have any questions, please feel free to contact us.</p>
      <p>KN Electronics Customer Service Team</p>
    `;

    await this.sendEmail(email, subject, html, data.rmaNumber, 'status_update');
  }

  private async sendEmail(
    to: string, 
    subject: string, 
    html: string, 
    rmaNumber: string, 
    type: 'submission' | 'approval' | 'rejection' | 'additional_info' | 'status_update'
  ) {
    try {
      const info = await this.transporter.sendMail({
        from: `"KN Electronics" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html
      });

      // Log email notification
      const rmaRequests = await db.query(
        'SELECT id FROM rma_requests WHERE rma_number = ?',
        [rmaNumber]
      );

      if (rmaRequests.length > 0) {
        await db.query(
          `INSERT INTO email_notifications (rma_request_id, email_type, recipient_email, subject, status)
           VALUES (?, ?, ?, ?, 'sent')`,
          [rmaRequests[0].id, type, to, subject]
        );
      }

      logger.info(`Email sent successfully to ${to}: ${subject}`);
    } catch (error) {
      logger.error('Email sending failed:', error);
      
      // Log failed email
      const rmaRequests = await db.query(
        'SELECT id FROM rma_requests WHERE rma_number = ?',
        [rmaNumber]
      );

      if (rmaRequests.length > 0) {
        await db.query(
          `INSERT INTO email_notifications (rma_request_id, email_type, recipient_email, subject, status)
           VALUES (?, ?, ?, ?, 'failed')`,
          [rmaRequests[0].id, type, to, subject]
        );
      }

      throw error;
    }
  }
}