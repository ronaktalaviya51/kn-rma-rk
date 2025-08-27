# Ubuntu Deployment Guide

## 🐧 Ubuntu Environment Setup

### System Requirements
- Ubuntu 18.04 LTS or later
- At least 2GB RAM
- 10GB available disk space

### 1. Install Docker and Docker Compose

```bash
# Update package list
sudo apt update

# Install required packages
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Add Docker official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Set up Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package list
sudo apt update

# Install Docker Engine
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add current user to docker group
sudo usermod -aG docker $USER

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Re-login to apply group changes
newgrp docker
```

### 2. Install Node.js

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 3. Deploy KN RMA System

```bash
# Clone project
git clone <repository-url>
cd kn-rma

# Set permissions
chmod +x setup-env.sh

# Auto-detect IP and start
./setup-env.sh
docker-compose up -d

# Or use npm command
npm install
npm run start
```

### 4. Ubuntu Specific Settings

#### Firewall Settings
```bash
# Open required ports
sudo ufw allow 8080/tcp  # Frontend
sudo ufw allow 3000/tcp  # Backend API
sudo ufw allow 3306/tcp  # MySQL (if external connection needed)
sudo ufw allow 2222/tcp  # SSH (optional)

# Enable firewall
sudo ufw enable
```

#### Systemd Service Setup
```bash
# Create systemd service (optional)
sudo tee /etc/systemd/system/kn-rma.service > /dev/null <<EOF
[Unit]
Description=KN RMA System
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/path/to/kn-rma
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Enable service
sudo systemctl enable kn-rma
sudo systemctl start kn-rma
```

## 🔧 Ubuntu Troubleshooting

### 1. Network Configuration Issues

#### Check Network Interfaces
```bash
ip addr show
ip route show
```

#### Set Static IP (if needed)
```bash
# Edit netplan configuration
sudo nano /etc/netplan/01-netcfg.yaml

# Example configuration
network:
  version: 2
  renderer: networkd
  ethernets:
    eth0:
      addresses:
        - 192.168.1.100/24
      gateway4: 192.168.1.1
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4]

# Apply configuration
sudo netplan apply
```

### 2. Docker Permission Issues

```bash
# If encountering permission issues
sudo chmod 666 /var/run/docker.sock

# Or restart Docker
sudo systemctl restart docker
```

### 3. Port Conflicts

```bash
# Check port usage
sudo netstat -tulnp | grep :8080
sudo netstat -tulnp | grep :3000

# Stop conflicting service
sudo systemctl stop <service-name>
```

### 4. Insufficient Memory

```bash
# Check system resources
free -h
df -h

# Add swap space
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 🚀 Automated Deployment Script

Create a full Ubuntu deployment script:

```bash
#!/bin/bash
# ubuntu-deploy.sh

# Check if run as root
if [[ $EUID -eq 0 ]]; then
   echo "Do not run this script as root"
   exit 1
fi

# Update system
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker
echo "Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Install Node.js
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Deploy application
echo "Deploying KN RMA System..."
chmod +x setup-env.sh
./setup-env.sh

# Start service
echo "Starting service..."
newgrp docker <<EOF
docker-compose up -d
EOF

echo "Deployment completed!"
echo "Frontend: http://$(hostname -I | awk '{print $1}'):8080"
echo "Backend: http://$(hostname -I | awk '{print $1}'):3000"
```

## 📊 Monitoring and Logs

### System Monitoring
```bash
# Monitor Docker containers
docker stats

# Check system resources
htop
iotop
```

### Application Logs
```bash
# View application logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 🔒 Security Recommendations

1. **Update System**: Regularly update Ubuntu and packages
2. **Firewall**: Configure UFW firewall
3. **SSL**: Use HTTPS in production
4. **Database**: Change default passwords
5. **Backup**: Regularly back up database and configurations

## 📞 Support

If you encounter issues in Ubuntu environment, please:

1. Check logs: `docker-compose logs`
2. Check system resources: `free -h` and `df -h`
3. Verify network configuration: `ip addr` and `ip route`
4. Confirm Docker status: `docker info`
