-- KN-RMA Database Schema
CREATE DATABASE IF NOT EXISTS kn_rma CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE kn_rma;

-- Users table (for admin authentication)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- RMA requests table
CREATE TABLE rma_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rma_number VARCHAR(20) UNIQUE,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20),
    order_number VARCHAR(50),
    po_number VARCHAR(50),
    product_name VARCHAR(200) NOT NULL,
    product_model VARCHAR(100),
    serial_number VARCHAR(100),
    quantity INT DEFAULT 1,
    purchase_date DATE,
    purchase_location VARCHAR(200),
    tracking_number VARCHAR(100),
    issue_description TEXT NOT NULL,
    return_reason ENUM('defective', 'wrong_item', 'damaged', 'not_as_described', 'other') NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'additional_info_required', 'processing', 'completed') DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    processed_by INT,
    processed_at TIMESTAMP NULL,
    FOREIGN KEY (processed_by) REFERENCES users(id)
);

-- File uploads table
CREATE TABLE file_uploads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rma_request_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rma_request_id) REFERENCES rma_requests(id) ON DELETE CASCADE
);

-- Email notifications log
CREATE TABLE email_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rma_request_id INT NOT NULL,
    email_type ENUM('submission', 'approval', 'rejection', 'additional_info', 'status_update') NOT NULL,
    recipient_email VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('sent', 'failed', 'pending') DEFAULT 'pending',
    FOREIGN KEY (rma_request_id) REFERENCES rma_requests(id) ON DELETE CASCADE
);

-- System settings table
CREATE TABLE system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password_hash, role) VALUES 
('admin', 'admin@example.com', '$2a$10$XPdW9YdCRilZlxCbOw6AnuCzTpFMYQwmio5ad5xOGU/TYVnVHara2', 'admin');

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('company_name', 'KN Electronics', 'Company name for emails and forms'),
('support_email', 'support@example.com', 'Support email address'),
('max_file_size', '10485760', 'Maximum file upload size in bytes (10MB)'),
('allowed_file_types', 'jpg,jpeg,png,gif,pdf,mp4,avi,mov', 'Allowed file extensions'),
('rma_number_prefix', 'KN-RMA-', 'Prefix for RMA numbers'),
('auto_approve_threshold', '1000', 'Auto-approve threshold amount');