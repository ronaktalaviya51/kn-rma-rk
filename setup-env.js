const os = require('os');
const fs = require('fs');
const path = require('path');

/**
 * Get all available network interface IP addresses
 */
function getNetworkInterfaces() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  
  for (const name of Object.keys(interfaces)) {
    const netInterface = interfaces[name];
    if (netInterface) {
      for (const net of netInterface) {
        // Skip internal and non-IPv4 addresses
        if (net.family === 'IPv4' && !net.internal) {
          ips.push(net.address);
        }
      }
    }
  }
  
  return ips;
}

/**
 * Get the primary external IP address
 */
function getPrimaryIP() {
  const ips = getNetworkInterfaces();
  
  // Prefer 192.168.x.x or 10.x.x.x (local network)
  const localIP = ips.find(ip => 
    ip.startsWith('192.168.') || 
    ip.startsWith('10.') || 
    ip.startsWith('172.')
  );
  
  if (localIP) return localIP;
  
  // If no local network IP is found, return the first available IP
  return ips[0] || 'localhost';
}

/**
 * Update environment variable files
 */
function updateEnvFiles() {
  const ip = getPrimaryIP();
  
  console.log(`Detected IP: ${ip}`);
  console.log(`Available IPs: ${getNetworkInterfaces().join(', ')}`);
  
  // Main .env file
  const mainEnvContent = `# Automatically detected server settings
SERVER_HOST=${ip}
FRONTEND_PORT=8080
BACKEND_PORT=3000

# API URLs
VUE_APP_API_BASE_URL=http://${ip}:3000
FRONTEND_URL=http://${ip}:8080

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
# Allowed domains (comma separated)
ALLOWED_DOMAINS=https://example.com,https://app.example.com,http://test.local
`;

  // Frontend .env file
  const frontendEnvContent = `VUE_APP_API_BASE_URL=http://${ip}:3000
`;

  // Write files
  fs.writeFileSync('.env', mainEnvContent);
  fs.writeFileSync(path.join('frontend', '.env'), frontendEnvContent);
  
  console.log('Environment files updated successfully!');
  console.log(`Frontend URL: http://${ip}:8080`);
  console.log(`Backend URL: http://${ip}:3000`);
  console.log(`Admin URL: http://${ip}:8080/admin`);
}

// Run update
updateEnvFiles();
