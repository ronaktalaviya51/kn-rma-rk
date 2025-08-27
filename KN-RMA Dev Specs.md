# KN-RMA System Integration Specification (Implementation Version, Phase 1 Only)

System Designed and Dev by Stan Wu 2025

Version: v1.8\
Date: 2025-07-04

---

## 1. System Objectives and Positioning

This system is an online RMA (Return Merchandise Authorization) platform with **return merchandise management** and **ERP integration preparatory** capabilities.\
It supports customers submitting return forms online, uploading supporting images, querying progress, as well as admin backend review, number generation, and email notifications.

Initially focused on **manual review** as the core, establishing the foundation for future AI and ERP integration upgrades.

---

## 2. User Roles and Permissions

### 1. Customer

- Submit RMA return request forms online
- Upload images and videos
- Query RMA progress and review results

### 2. Admin

- Login to backend
- Browse and filter RMA request records
- Review uploaded data
- Execute approval/rejection/supplementary requests
- Send email notifications
- Generate RMA numbers
- Manually mark ERP sync status

---

## 3. System Function Modules

### (1) RMA Online Form Module

| Item | Description |
| ---- | ----------- |
| Form Fields | Customer information, order number, PO number, product model, quantity, serial number, return reason, tracking number |
| File Upload | Support multiple images and videos, with format and size restrictions |
| Initial Status | Pending Approval |
| Notice | Do not return merchandise, wait for review notification |

### (2) Shield Scoring Module (Manual Only)

| Item | Description |
| ---- | ----------- |
| Risk Score Fields | fraud_score, eligibility (stored in database for manual review) |
| Review Process | Fully manual operation by admin, executing approval, rejection, supplementary requests |

### (3) RMA Number and Email Notification Module

| Item | Description |
| ---- | ----------- |
| Number Format | RMA-YYYYMMDD-0001 |
| Email Notification | Automatically sent when Approved / Rejected / Manual Review status updates |
| Email Content | RMA number, return address, important notes |
| Email Service | SMTP, SendGrid, Gmail API |

### (4) ERP Integration Module (Manual Marking Only)

| Item | Description |
| ---- | ----------- |
| ERP Support | NetSuite / QuickBooks / Oracle ERP (marking only, no automatic sync) |
| Manual Operation | Admin marks erp_sync_status in backend: Pending / Success / Failed |

### (5) Admin Dashboard Module

| Function | Description |
| -------- | ----------- |
| Login Authentication | Username, password |
| Filter Criteria | Status, Fraud Score, presence of images/tracking number |
| Single Record View | Display details, file preview |
| Operations | Approve, reject, request supplements, send notifications |
| Number Generation | One-click RMA number generation |
| Statistics Module | Return quantity, monthly approval rate, return amount estimation |

### (6) Customer Progress Query Module

| Function | Description |
| -------- | ----------- |
| Query Criteria | Email + Order Number or RMA Number |
| Display Information | Current status, RMA number, review time, ERP status |

---

## 4. Technical Architecture

| Component | Technology Stack |
| --------- | --------------- |
| Development Framework | Docker Compose |
| Backend | Node.js + TypeScript |
| Frontend | Vue.js (complete application with routing and state management) |
| Database | MySQL (UTF8 support) |
| Admin Interface | Vue.js + Bootstrap5 |
| File Storage | Local or AWS S3 |
| Email Service | SMTP or SendGrid / Gmail API |
| Security Solution | Login authentication, file encryption |
| Remote Development Support | SSH + VS Code Remote + .devcontainer + GitHub Codespaces |

---

## 5. Docker Compose Configuration (Complete Version with SSH Support and Vue.js Frontend)

```yaml
version: '3.8'

services:
  backend:
    image: node:18-alpine
    container_name: kn-rma-backend
    restart: always
    working_dir: /app
    volumes:
      - ./backend:/app
    command: ["npm", "run", "start"]
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DB_HOST=db
      - DB_USER=root
      - DB_PASSWORD=your_password
      - DB_NAME=kn_rma
    depends_on:
      - db

  frontend:
    image: node:18-alpine
    container_name: kn-rma-frontend
    working_dir: /app
    volumes:
      - ./frontend:/app
    command: ["npm", "run", "serve"]
    ports:
      - "8080:8080"

  db:
    image: mysql:8.0
    container_name: kn-rma-db
    restart: always
    environment:
      - MYSQL_ROOT_PASSWORD=your_password
      - MYSQL_DATABASE=kn_rma
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql

  ssh:
    image: linuxserver/openssh-server
    container_name: kn-rma-ssh
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Taipei
      - PASSWORD_ACCESS=true
      - USER_NAME=developer
      - USER_PASSWORD=your_ssh_password
    ports:
      - "2222:2222"
    volumes:
      - ./:/config/projects

volumes:
  db_data:
```

---

## 6. VS Code `.devcontainer` Configuration (Complete Version)

📁 `.devcontainer/`

### devcontainer.json

```json
{
  "name": "KN-RMA DevContainer",
  "dockerComposeFile": "../docker-compose.yml",
  "service": "ssh",
  "workspaceFolder": "/config/projects",
  "settings": {
    "terminal.integrated.shell.linux": "/bin/bash",
    "editor.formatOnSave": true
  },
  "extensions": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "vue.volar",
    "ms-azuretools.vscode-docker"
  ],
  "postCreateCommand": "echo 'KN-RMA DevContainer ready'"
}
```

### Dockerfile (Optional, for custom development tools)

```dockerfile
FROM node:18-alpine

RUN apk add --no-cache bash git openssh

WORKDIR /workspace
```

---

✅ Supports VS Code Remote Container and GitHub Codespaces synchronization. ✅ One-click startup, immediate development. ✅ Direct npm commands and Vue.js frontend development within container.

If needed, I can further assist with automated deployment or CI/CD integration design.

