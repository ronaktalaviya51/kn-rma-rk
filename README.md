
# KN-RMA System

System Designed and Developed by Stan Wu 2025

KN EC Professional Return Merchandise Authorization System

## 🌟 Features

- **Automatic IP Detection**: Supports macOS, Linux (including Ubuntu), and Windows  
- **Dynamic Domain Management**: Automatically detects and allows domains like `https://xyz.com`, `http://test.local`  
- **Cross-Platform Deployment**: One-click deployment, automatically adapts to different environments  
- **Smart CORS Configuration**: Automatically allows all detected IPs and domains  
- **Containerized Deployment**: Uses Docker to ensure environment consistency  
- **Complete RMA Workflow**: Full process management from request to completion  

## 🚀 Quick Start

### General Deployment (Recommended)

```bash
# 1. Clone project
git clone <repository-url>
cd kn-rma

# 2. Install and start
npm install
npm run start

# 3. Open browser
# Frontend: http://[YourIP]:8080
# Backend: http://[YourIP]:3000
```

### Ubuntu Deployment

```bash
# One-click installation of dependencies and deployment
./ubuntu-deploy.sh
```

### Compatibility Test

```bash
# Check system compatibility
./compatibility-test.sh
```

## 📋 System Requirements

### Basic Requirements
- **Node.js** 16.0 or later  
- **Docker** 20.0 or later  
- **Docker Compose** 2.0 or later  

### Ubuntu Specific Requirements
- Ubuntu 18.04 LTS or later  
- Minimum 2GB RAM  
- 10GB free disk space  

### Supported Operating Systems
- ✅ Ubuntu 18.04+  
- ✅ macOS 10.15+  
- ✅ Windows 10+  
- ✅ CentOS 7+  
- ✅ Debian 9+  

## 🛠️ Available Commands

| Command | Description |
|---------|-------------|
| `npm run start` | Auto configure and start all services |
| `npm run stop` | Stop all services |
| `npm run restart` | Restart all services |
| `npm run setup` | Run IP detection and environment setup only |
| `npm run logs` | View all service logs |
| `npm run logs:backend` | View backend logs |
| `npm run logs:frontend` | View frontend logs |
| `npm run logs:db` | View database logs |
| `npm run status` | View service status |
| `npm run health` | Check backend health |
| `npm run build` | Rebuild Docker image |
| `npm run clean` | Clean all containers and images |

### Ubuntu Specific Commands

| Command | Description |
|---------|-------------|
| `./ubuntu-deploy.sh` | Ubuntu one-click deployment script |
| `./setup-env.sh` | General environment setup script |
| `./compatibility-test.sh` | System compatibility test |

## 🔧 Automatic IP Detection

The system automatically detects the following types of IP addresses:

### Supported Detection Methods
1. **Node.js Native**: `os.networkInterfaces()`  
2. **Linux Commands**: `hostname -I`, `ip route`  
3. **General Commands**: `ifconfig`  
4. **External Services**: `ipify.org`, `ipinfo.io`  

### Automatic CORS Setup
The system automatically allows the following sources:  
- `http://localhost:8080`  
- `http://127.0.0.1:8080`  
- `http://[DetectedIPs]:8080`  
- `https://[customdomain].com`  
- `http://[customdomain].local`  
- Custom origins specified in environment variables  

### Domain Management API
- `GET /api/cors/allowed-domains` - Get allowed domains  
- `POST /api/cors/allowed-domains` - Add domain  
- `POST /api/cors/test-domain` - Test if a domain is allowed  
- `GET /api/cors/domain-stats` - Get statistics  

## 📱 Application Access

After starting, you can access:  

- **Frontend App**: `http://[YourIP]:8080`  
- **Admin Dashboard**: `http://[YourIP]:8080/admin`  
- **Backend API**: `http://[YourIP]:3000`  
- **API Docs**: `http://[YourIP]:3000/api-docs`  

## 🐧 Ubuntu Specific Features

### System Integration
- Auto install Docker and Docker Compose  
- Auto configure firewall rules  
- Support systemd service management  
- Auto detect network configuration  

### Performance Optimization
- Optimized for Ubuntu network interfaces  
- Supports multiple IP detection methods  
- Automatically handles Docker permission issues  

## Demo Video

https://youtu.be/Y4QeB6SC_ZU?si=zS4Fq3Mf4MkYe7Ws

## Technical Architecture

### Backend
- **Framework**: Node.js + TypeScript + Express  
- **Database**: MySQL 8.0  
- **Authentication**: JWT  
- **File Upload**: Multer  
- **Email**: Nodemailer  
- **Logging**: Winston  

### Frontend
- **Framework**: Vue.js 3 + TypeScript  
- **State Management**: Vuex 4  
- **Routing**: Vue Router 4  
- **UI Framework**: Bootstrap 5  
- **HTTP Client**: Axios  
- **Notifications**: Vue Toastification  

### Deployment
- **Containerization**: Docker + Docker Compose  
- **Development Environment**: VS Code + .devcontainer  
- **Database**: MySQL Container  
- **Reverse Proxy**: Configurable Nginx  

## Quick Start

### Using Docker Compose (Recommended)

1. **Clone the project**

```bash
git clone <repository-url>
cd kn-rma
```

2. **Configure environment variables**

```bash
# Copy and edit environment variables in docker-compose.yml
# Modify database password, SMTP settings, etc.
```

3. **Start services**

```bash
docker-compose up -d
```

4. **Install dependencies and start**

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd ../frontend
npm install
npm run serve
```

### Using VS Code DevContainer

1. Install VS Code + Remote Containers extension  
2. Open the project folder  
3. Click "Reopen in Container"  
4. Container will start and configure automatically  

## Service Ports

- **Frontend**: http://localhost:8080  
- **Backend API**: http://localhost:3000  
- **MySQL**: localhost:3306  
- **SSH**: localhost:2222  

## Default Accounts

### Admin Login
- Username: `admin`  
- Password: `admin123`  

## API Documentation

### Authentication

```
POST /api/auth/login          # Admin login
GET  /api/auth/verify         # Verify token
POST /api/auth/logout         # Logout
```

### RMA Requests

```
POST /api/rma/request                    # Create RMA request
GET  /api/rma/status/:rmaNumber         # Query RMA status
GET  /api/rma/requests                  # Get request list (admin)
GET  /api/rma/requests/:id              # Get request details (admin)
PUT  /api/rma/requests/:id/status       # Update request status (admin)
DELETE /api/rma/requests/:id            # Delete request (admin)
GET  /api/rma/stats                     # Get statistics (admin)
```

### File Uploads

```
POST /api/upload/rma/:rmaId             # Upload RMA related files
GET  /api/upload/file/:fileId           # Download file
DELETE /api/upload/file/:fileId         # Delete file (admin)
```

## Database Structure

### Main Tables
- `users` - Admin accounts  
- `rma_requests` - RMA request records  
- `file_uploads` - Uploaded file records  
- `email_notifications` - Email notification records  
- `system_settings` - System settings  

## Features

### Customer Features
- ✅ Online RMA request form  
- ✅ Upload related images/videos/documents  
- ✅ Query request status and progress  
- ✅ Receive email notifications  

### Admin Features
- ✅ Request list and filtering  
- ✅ Request detail viewing  
- ✅ Status updates and comments  
- ✅ Quick approval/rejection  
- ✅ Statistics dashboard  
- ✅ File management  

### System Features
- ✅ Auto-generate RMA numbers  
- ✅ Automatic email notifications  
- ✅ Secure file storage  
- ✅ Status change logging  
- ✅ Permission management  
- ✅ System logging  

## Development Guide

### Backend Development

```bash
cd backend
npm run dev          # Development mode
npm run build        # Build
npm run test         # Test
npm run lint         # Code linting
```

### Frontend Development

```bash
cd frontend
npm run serve        # Development server
npm run build        # Build production version
npm run test:unit    # Unit tests
npm run lint         # Code linting
```

## Deployment Instructions

### Production Deployment

1. **Environment Variable Configuration**
   - Set database connection  
   - Configure SMTP service  
   - Set JWT secret key  
   - Configure file storage path  

2. **Build Application**

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

3. **Start Services**

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## License

Copyright © 2024 Kasernet Inc. All rights reserved.

## Contact Information

- **Project**: KN-RMA System  
- **Version**: v1.0.0  
- **Maintained by**: KN EC Team  
#
