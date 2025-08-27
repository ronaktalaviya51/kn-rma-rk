#!/bin/bash

# Script to automatically detect IP address and set environment variables
# Supports Ubuntu, CentOS, macOS

# Get the primary network interface IP address
get_primary_ip() {
    local ip=""
    
    # Method 1: Use hostname -I (Linux, especially suitable for Ubuntu)
    if command -v hostname >/dev/null 2>&1; then
        # Ubuntu/Debian systems
        ip=$(hostname -I 2>/dev/null | awk '{print $1}')
        if [ -n "$ip" ] && [ "$ip" != "127.0.0.1" ]; then
            echo "$ip"
            return
        fi
    fi
    
    # Method 2: Use ip route (modern Linux systems, including Ubuntu 18+)
    if command -v ip >/dev/null 2>&1; then
        # Get the source IP of the default route
        ip=$(ip route get 8.8.8.8 2>/dev/null | grep -Po 'src \K\S+' | head -1)
        if [ -n "$ip" ] && [ "$ip" != "127.0.0.1" ]; then
            echo "$ip"
            return
        fi
        
        # Fallback: get the first non-localhost IP from ip addr
        ip=$(ip addr show 2>/dev/null | grep 'inet ' | grep -v '127.0.0.1' | head -1 | awk '{print $2}' | cut -d'/' -f1)
        if [ -n "$ip" ]; then
            echo "$ip"
            return
        fi
    fi
    
    # Method 3: Use ifconfig (older systems or macOS)
    if command -v ifconfig >/dev/null 2>&1; then
        # Linux format
        ip=$(ifconfig 2>/dev/null | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -1)
        if [ -n "$ip" ]; then
            echo "$ip"
            return
        fi
        
        # macOS format
        ip=$(ifconfig 2>/dev/null | grep 'inet ' | grep -v '127.0.0.1' | head -1 | awk '{print $2}')
        if [ -n "$ip" ]; then
            echo "$ip"
            return
        fi
    fi
    
    # Method 4: Use curl to query external services (last fallback option)
    if command -v curl >/dev/null 2>&1; then
        # Try multiple services to improve reliability
        ip=$(curl -s --max-time 5 https://api.ipify.org 2>/dev/null || \
             curl -s --max-time 5 https://ipinfo.io/ip 2>/dev/null || \
             curl -s --max-time 5 https://icanhazip.com 2>/dev/null | tr -d '\n')
        if [ -n "$ip" ]; then
            echo "$ip"
            return
        fi
    fi
    
    # If all methods fail, use localhost
    echo "localhost"
}

# Detect operating system
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$NAME
        VERSION=$VERSION_ID
    elif [ -f /etc/redhat-release ]; then
        OS="Red Hat"
        VERSION=$(cat /etc/redhat-release | sed 's/.*release //' | sed 's/ .*//')
    elif [ -f /etc/debian_version ]; then
        OS="Debian"
        VERSION=$(cat /etc/debian_version)
    elif [ "$(uname)" == "Darwin" ]; then
        OS="macOS"
        VERSION=$(sw_vers -productVersion)
    else
        OS=$(uname -s)
        VERSION=$(uname -r)
    fi
    
    echo "Detected OS: $OS $VERSION"
}

# Check if Docker is running
check_docker() {
    if ! command -v docker >/dev/null 2>&1; then
        echo "Warning: Docker is not installed or not in PATH"
        return 1
    fi
    
    if ! docker info >/dev/null 2>&1; then
        echo "Warning: Docker is not running or insufficient permissions"
        echo "Ubuntu users may need to run: sudo usermod -aG docker $USER"
        echo "Then log in again or run: newgrp docker"
        return 1
    fi
    
    return 0
}

# Get IP address
echo "Detecting system environment..."
detect_os

echo "Checking Docker environment..."
check_docker

echo "Detecting IP address..."
IP=$(get_primary_ip)

echo "Detected IP address: $IP"

# Validate IP address format
if echo "$IP" | grep -E '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$' >/dev/null; then
    echo "IP address format validation passed"
else
    echo "Warning: IP address format may be incorrect: $IP"
fi

# Update .env file
cat > .env << EOF
# Automatically detected server settings
SERVER_HOST=$IP
FRONTEND_PORT=8080
BACKEND_PORT=3000

# API URLs
VUE_APP_API_BASE_URL=http://$IP:3000
FRONTEND_URL=http://$IP:8080

# Database configuration
DB_HOST=db
DB_USER=root
DB_PASSWORD=coofee2iucheiphienei
DB_NAME=kn_rma

# JWT settings
JWT_SECRET=your_jwt_secret_change_this_in_production

# SMTP configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Custom CORS origins (comma separated)
CUSTOM_ORIGINS=
EOF

# Update frontend .env file
cat > frontend/.env << EOF
VUE_APP_API_BASE_URL=http://$IP:3000
EOF

echo "Environment files updated with IP: $IP"
echo "Frontend URL: http://$IP:8080"
echo "Backend URL: http://$IP:3000"
