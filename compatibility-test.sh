#!/bin/bash

# Cross-platform compatibility test script

echo "=================================="
echo "KN RMA System Compatibility Test"
echo "=================================="

# Detect operating system
OS="Unknown"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS="$NAME $VERSION_ID"
    else
        OS="Linux"
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macOS $(sw_vers -productVersion)"
elif [[ "$OSTYPE" == "msys" ]]; then
    OS="Windows"
fi

echo "Operating System: $OS"
echo "Architecture: $(uname -m)"
echo

# Check Node.js
echo "🔍 Checking Node.js..."
if command -v node &> /dev/null; then
    echo "✅ Node.js: $(node --version)"
else
    echo "❌ Node.js not installed"
fi

# Check Docker
echo "🔍 Checking Docker..."
if command -v docker &> /dev/null; then
    echo "✅ Docker: $(docker --version)"
    if docker info &> /dev/null; then
        echo "✅ Docker service is running"
    else
        echo "⚠️ Docker service not running"
    fi
else
    echo "❌ Docker not installed"
fi

# Check Docker Compose
echo "🔍 Checking Docker Compose..."
if command -v docker-compose &> /dev/null; then
    echo "✅ Docker Compose: $(docker-compose --version)"
elif docker compose version &> /dev/null; then
    echo "✅ Docker Compose (plugin): $(docker compose version)"
else
    echo "❌ Docker Compose not installed"
fi

# Test IP detection
echo "🔍 Testing IP detection..."
if [ -f "setup-env.js" ]; then
    echo "Using Node.js to detect IP..."
    node -e "
    const os = require('os');
    const interfaces = os.networkInterfaces();
    const ips = [];
    
    for (const name of Object.keys(interfaces)) {
        const netInterface = interfaces[name];
        if (netInterface) {
            for (const net of netInterface) {
                const isIPv4 = net.family === 'IPv4' || net.family === 4;
                if (isIPv4 && !net.internal) {
                    ips.push(net.address);
                }
            }
        }
    }
    
    console.log('Detected IP addresses:', ips.join(', '));
    "
else
    echo "❌ setup-env.js not found"
fi

# Test network tools
echo "🔍 Testing network tools..."

# hostname command
if command -v hostname &> /dev/null; then
    echo "✅ hostname available"
    if hostname -I &> /dev/null; then
        echo "✅ hostname -I supported (Linux)"
    else
        echo "ℹ️ hostname -I not supported (likely macOS)"
    fi
else
    echo "❌ hostname command not available"
fi

# ip command
if command -v ip &> /dev/null; then
    echo "✅ ip command available (modern Linux)"
else
    echo "ℹ️ ip command not available (likely macOS or older Linux)"
fi

# ifconfig command
if command -v ifconfig &> /dev/null; then
    echo "✅ ifconfig command available"
else
    echo "ℹ️ ifconfig command not available"
fi

# Check ports
echo "🔍 Checking port usage..."
check_port() {
    local port=$1
    local service=$2
    
    if command -v netstat &> /dev/null; then
        if netstat -tuln | grep -q ":$port "; then
            echo "⚠️ Port $port ($service) is already in use"
        else
            echo "✅ Port $port ($service) is available"
        fi
    elif command -v ss &> /dev/null; then
        if ss -tuln | grep -q ":$port "; then
            echo "⚠️ Port $port ($service) is already in use"
        else
            echo "✅ Port $port ($service) is available"
        fi
    else
        echo "ℹ️ Cannot check port $port ($service) - missing netstat or ss"
    fi
}

check_port 8080 "Frontend"
check_port 3000 "Backend"
check_port 3306 "MySQL"

# Test internet connectivity
echo "🔍 Testing internet connectivity..."
if ping -c 1 google.com &> /dev/null; then
    echo "✅ Internet connection OK"
else
    echo "⚠️ Unable to connect to the internet"
fi

echo
echo "=================================="
echo "✅ Compatibility test completed"
echo "=================================="
echo

# Recommendations based on OS
if [[ "$OS" == *"Ubuntu"* ]]; then
    echo "💡 Recommendation: use Ubuntu deployment script:"
    echo "   ./ubuntu-deploy.sh"
elif [[ "$OS" == *"macOS"* ]]; then
    echo "💡 Recommendation: use standard deployment:"
    echo "   npm run start"
else
    echo "💡 Recommendation: use Docker deployment:"
    echo "   docker-compose up -d"
fi
