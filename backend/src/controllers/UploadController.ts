import { Request, Response } from 'express';
import { db } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';

export class UploadController {
  async uploadRmaFiles(req: Request, res: Response) {
    const { rmaId } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      throw createError('No files uploaded', 400);
    }

    // Verify RMA request exists
    const rmaRequests = await db.query(
      'SELECT id FROM rma_requests WHERE id = ?',
      [rmaId]
    );

    if (rmaRequests.length === 0) {
      throw createError('RMA request not found', 404);
    }

    const uploadedFiles = [];

    for (const file of files) {
      const result = await db.query(
        `INSERT INTO file_uploads (rma_request_id, file_name, file_path, file_type, file_size)
         VALUES (?, ?, ?, ?, ?)`,
        [rmaId, file.originalname, file.path, file.mimetype, file.size]
      );

      uploadedFiles.push({
        id: result.insertId,
        filename: file.originalname,
        size: file.size,
        type: file.mimetype
      });
    }

    logger.info(`${files.length} files uploaded for RMA request ${rmaId}`);

    res.json({
      success: true,
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });
  }

  async getFile(req: Request, res: Response) {
    const { fileId } = req.params;

    const files = await db.query(
      'SELECT * FROM file_uploads WHERE id = ?',
      [fileId]
    );

    if (files.length === 0) {
      throw createError('File not found', 404);
    }

    const file = files[0];

    if (!fs.existsSync(file.file_path)) {
      throw createError('File not found on disk', 404);
    }

    res.setHeader('Content-Type', file.file_type);
    res.setHeader('Content-Disposition', `attachment; filename="${file.file_name}"`);
    res.sendFile(path.resolve(file.file_path));
  }

  async deleteFile(req: Request, res: Response) {
    const { fileId } = req.params;

    const files = await db.query(
      'SELECT * FROM file_uploads WHERE id = ?',
      [fileId]
    );

    if (files.length === 0) {
      throw createError('File not found', 404);
    }

    const file = files[0];

    // Delete from database
    await db.query('DELETE FROM file_uploads WHERE id = ?', [fileId]);

    // Delete from disk
    if (fs.existsSync(file.file_path)) {
      fs.unlinkSync(file.file_path);
    }

    logger.info(`File ${file.file_name} deleted (ID: ${fileId})`);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  }
}