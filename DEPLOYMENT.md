# KN RMA System - Automatic Deployment Guide

## 🚀 Quick Start

### Auto Configure and Start

```bash
# Automatically detect IP, set environment variables, then start services
npm run start
```

### Manual Setup
```bash
# 1. Automatically detect IP and update environment variables
node setup-env.js

# Or use shell script (Linux/macOS)
./setup-env.sh

# 2. Start services
docker-compose up -d
```

## 📝 Available Commands

| Command | Description |
|------|------|
| `npm run setup` | Auto-detect IP and set environment variables |
| `npm run start` | Auto configure and start all services |
| `npm run stop` | Stop all services |
| `npm run restart` | Restart all services |
| `npm run logs` | View logs of all services |
| `npm run logs:backend` | View backend logs |
| `npm run logs:frontend` | View frontend logs |
| `npm run logs:db` | View database logs |
| `npm run build` | Rebuild Docker images |
| `npm run clean` | Clean all containers and unused images |

## 🔧 Automatic IP Detection

The system will automatically detect the following IP addresses:

1. **Local network IPs** (192.168.x.x, 10.x.x.x, 172.x.x.x)  
2. **All available network interfaces**  
3. **Automatically configure allowed CORS origins**  

### Supported Environment Variables

- `CUSTOM_ORIGINS`: Custom CORS origins (comma-separated)  
- `FRONTEND_URL`: Manually specify frontend URL  
- `VUE_APP_API_BASE_URL`: Manually specify API base URL  

## 🌐 Accessing the Application

Once the system is started, you will see the following URLs:

- **Frontend App**: http://[detected-IP]:8080  
- **Backend API**: http://[detected-IP]:3000  
- **Admin Dashboard**: http://[detected-IP]:8080/admin  

## 📋 Deployment Steps

1. **Clone the project**
   ```bash
   git clone <repository-url>
   cd kn-rma
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start services**
   ```bash
   npm run start
   ```

4. **Check logs**
   ```bash
   npm run logs
   ```

## 🔒 Security Settings

### Production Recommendations

1. **Change default passwords**
   ```bash
   # Edit .env file
   JWT_SECRET=your_secure_jwt_secret
   DB_PASSWORD=your_secure_db_password
   ```

2. **Configure SMTP**
   ```bash
   SMTP_HOST=your_smtp_host
   SMTP_PORT=587
   SMTP_USER=your_email@domain.com
   SMTP_PASS=your_app_password
   ```

3. **Custom CORS origins**
   ```bash
   CUSTOM_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com
   ```

## 🐛 Troubleshooting

### Common Issues

1. **Unable to detect IP**
   - Manually set environment variable `SERVER_HOST`
   - Check network connection

2. **CORS error**
   - Check `CUSTOM_ORIGINS` setting
   - Ensure frontend and backend URLs are correct

3. **Service cannot start**
   - Check if ports are already in use
   - View logs: `npm run logs`

### Reset System

```bash
# Fully clean and restart
npm run clean
npm run start
```

## 📞 Support

If you encounter any issues, check the logs or contact the technical support team.
