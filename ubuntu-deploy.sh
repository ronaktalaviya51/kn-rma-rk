#!/bin/bash 

# Ubuntu Auto Deployment Script
# For Ubuntu 18.04+ systems

set -e  # Exit on error

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on Ubuntu
check_ubuntu() {
    if ! grep -q "Ubuntu" /etc/os-release; then
        log_error "This script is designed for Ubuntu only"
        exit 1
    fi
    
    local version=$(grep VERSION_ID /etc/os-release | cut -d'"' -f2)
    log_info "Detected Ubuntu $version"
}

# Check if user is root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_error "Do not run this script as root"
        exit 1
    fi
}

# Check network connection
check_network() {
    log_info "Checking network connection..."
    if ! ping -c 1 google.com &> /dev/null; then
        log_error "Unable to connect to the Internet"
        exit 1
    fi
    log_success "Network connection is OK"
}

# Update system
update_system() {
    log_info "Updating system packages..."
    sudo apt update
    sudo apt upgrade -y
    log_success "System update complete"
}

# Install Docker
install_docker() {
    if command -v docker &> /dev/null; then
        log_info "Docker is already installed"
        return
    fi
    
    log_info "Installing Docker..."
    
    # Install required packages
    sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
    
    # Add Docker official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Add Docker repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Add user to docker group
    sudo usermod -aG docker $USER
    
    # Start Docker service
    sudo systemctl start docker
    sudo systemctl enable docker
    
    log_success "Docker installation complete"
}

# Install Node.js
install_nodejs() {
    if command -v node &> /dev/null; then
        local version=$(node --version)
        log_info "Node.js is already installed (version: $version)"
        return
    fi
    
    log_info "Installing Node.js..."
    
    # Install Node.js 18.x
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    local version=$(node --version)
    log_success "Node.js installation complete (version: $version)"
}

# Configure firewall
setup_firewall() {
    log_info "Configuring firewall..."
    
    # Check if UFW is installed
    if ! command -v ufw &> /dev/null; then
        sudo apt install -y ufw
    fi
    
    # Configure firewall rules
    sudo ufw allow ssh
    sudo ufw allow 8080/tcp  # Frontend
    sudo ufw allow 3000/tcp  # Backend API
    
    # Enable firewall if not already active
    if ! sudo ufw status | grep -q "Status: active"; then
        echo "y" | sudo ufw enable
        log_success "Firewall enabled"
    else
        log_info "Firewall is already enabled"
    fi
}

# Deploy application
deploy_application() {
    log_info "Deploying KN RMA system..."
    
    # Ensure setup script has execute permission
    chmod +x setup-env.sh
    
    # Run IP detection and environment setup
    ./setup-env.sh
    
    # Reload docker group (avoid permission issues)
    newgrp docker <<EOF
# Start Docker services
docker-compose up -d
EOF
    
    log_success "Application deployed successfully"
}

# Show results
show_results() {
    local ip=$(hostname -I | awk '{print $1}')
    
    echo
    echo "=================================="
    echo "🎉 Deployment Complete!"
    echo "=================================="
    echo "Frontend App: http://$ip:8080"
    echo "Backend API: http://$ip:3000"
    echo "Admin Panel: http://$ip:8080/admin"
    echo "=================================="
    echo
    echo "Useful commands:"
    echo "  View logs: docker-compose logs -f"
    echo "  Restart: docker-compose restart"
    echo "  Stop services: docker-compose down"
    echo "  System status: docker-compose ps"
    echo
}

# Main function
main() {
    echo "=================================="
    echo "KN RMA System Ubuntu Auto Deployment Script"
    echo "=================================="
    echo
    
    check_ubuntu
    check_root
    check_network
    
    log_info "Installing dependencies..."
    update_system
    install_docker
    install_nodejs
    setup_firewall
    
    log_info "Starting deployment..."
    deploy_application
    
    show_results
    
    echo "Note: If this is your first time installing Docker, you may need to log out and log back in"
    echo "or run: newgrp docker"
}

# Run main
main "$@"
