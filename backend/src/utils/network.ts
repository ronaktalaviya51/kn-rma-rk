import os from 'os';

// Get all available network interface IP addresses
// Supports Windows, macOS, Linux (including Ubuntu)

export function getNetworkInterfaces(): string[] {
  const interfaces = os.networkInterfaces();
  const ips: string[] = [];
  
  for (const name of Object.keys(interfaces)) {
    const netInterface = interfaces[name];
    if (netInterface) {
      for (const net of netInterface) {
        // Skip internal and non-IPv4 addresses
        // In Node.js 18+, family can be 'IPv4' or 4
        const isIPv4 = net.family === 'IPv4' || (net.family as any) === 4;
        if (isIPv4 && !net.internal) {
          ips.push(net.address);
        }
      }
    }
  }
  
  return ips;
}

/**
 * Get primary external IP address
 * Optimize IP detection for Ubuntu environment
 */
export function getPrimaryIP(): string {
  const ips = getNetworkInterfaces();

  // Ubuntu common network interface priority
  const preferredRanges = [
    '192.168.',  // Home router
    '10.',       // Corporate intranet
    '172.16.',   // Docker default range
    '172.17.',   // Docker default range
    '172.18.',   // Docker Compose default range
    '172.19.',   // Docker Compose default range
    '172.20.',   // Docker Compose default range
  ];

  // Find IP by priority
  for (const range of preferredRanges) {
    const ip = ips.find(ip => ip.startsWith(range));
    if (ip) return ip;
  }

  // If no preferred IP is found, return the first non-Docker internal IP
  const nonDockerIP = ips.find(ip => !ip.startsWith('172.'));
  if (nonDockerIP) return nonDockerIP;

  // Finally return the first available IP or localhost
  return ips[0] || 'localhost';
}

/**
 * Generate allowed CORS origins dynamically
 * Supports multiple environments and IP types
 */
export function generateAllowedOrigins(ports: number[] = [8080, 3000]): string[] {
  const origins: string[] = [];
  const ips = getNetworkInterfaces();

  // Add localhost
  ports.forEach((port) => {
    origins.push(`http://localhost:${port}`);
    origins.push(`http://127.0.0.1:${port}`);
  });

  // Add all network interfaces’ IP addresses IP
  ips.forEach((ip) => {
    ports.forEach((port) => {
      origins.push(`http://${ip}:${port}`);
    });
  });

  // Add environment variable specified URLs
  if (process.env.FRONTEND_URL) {
    origins.push(process.env.FRONTEND_URL);
  }

  if (process.env.CUSTOM_ORIGINS) {
    const customOrigins = process.env.CUSTOM_ORIGINS.split(",").map((s) =>
      s.trim()
    );
    origins.push(...customOrigins);
  }

  return [...new Set(origins)]; // Remove duplicates
}

/**
 * Log network information
 */
export function logNetworkInfo(logger: any): void {
  const ips = getNetworkInterfaces();
  const primaryIP = getPrimaryIP();
  
  logger.info('Network Information:');
  logger.info(`Primary IP: ${primaryIP}`);
  logger.info(`Available IPs: ${ips.join(', ')}`);
  logger.info(`Generated Origins: ${generateAllowedOrigins([8080]).join(', ')}`);
}

/**
 * Detect domain from HTTP request
 */
export function detectDomainFromRequest(req: any): string | null {
  try {
    // Method 1: Get from Origin header (most accurate)
    if (req.headers.origin) {
      const url = new URL(req.headers.origin);
      return url.origin; // Include protocol://domain:port
    }

    // Method 2: Get from Referer header
    if (req.headers.referer) {
      const url = new URL(req.headers.referer);
      return url.origin;
    }

    // Method 3: Get from Host header (requires inferring protocol)
    if (req.headers.host) {
      const protocol = req.headers['x-forwarded-proto'] || 
                      (req.connection.encrypted ? 'https' : 'http');
      return `${protocol}://${req.headers.host}`;
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Dynamic CORS allowed list management
 */
class DynamicCorsManager {
  private allowedDomains: Set<string> = new Set();
  private domainPatterns: RegExp[] = [];
  
  constructor() {
    // Default allowed domain patterns
    this.addDomainPattern(/^https?:\/\/localhost(:\d+)?$/);
    this.addDomainPattern(/^https?:\/\/127\.0\.0\.1(:\d+)?$/);
    this.addDomainPattern(/^https?:\/\/192\.168\.\d+\.\d+(:\d+)?$/);
    this.addDomainPattern(/^https?:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/);
    this.addDomainPattern(/^https?:\/\/172\.\d+\.\d+\.\d+(:\d+)?$/);
  }
  
  /**
   * Add allowed domain
   */
  addDomain(domain: string): void {
    this.allowedDomains.add(domain);
  }
  
  /**
   * Add domain pattern
   */
  addDomainPattern(pattern: RegExp): void {
    this.domainPatterns.push(pattern);
  }
  
  /**
   * Check if domain is allowed
   */
  isAllowed(origin: string): boolean {
    // Check exact match
    if (this.allowedDomains.has(origin)) {
      return true;
    }

    // Check pattern matching
    return this.domainPatterns.some(pattern => pattern.test(origin));
  }

  /**
   * Dynamically learn new domains (optional feature)
   */
  learnDomain(origin: string, req: any): boolean {
    // Basic security check
    if (!origin || !this.isValidDomain(origin)) {
      return false;
    }
    
    // Additional validation logic can be added
    // For example: check if the request comes from a trusted IP, validate SSL certificates, etc.

    // Temporary allow (can be stored in a database or cache)
    this.addDomain(origin);
    return true;
  }
  
  /**
   * Validate domain format
   */
  private isValidDomain(origin: string): boolean {
    try {
      const url = new URL(origin);
      return ['http:', 'https:'].includes(url.protocol);
    } catch {
      return false;
    }
  }
  
  /**
   * Get all allowed domains
   */
  getAllowedDomains(): string[] {
    return Array.from(this.allowedDomains);
  }
}

// Dynamic CORS manager
export const corsManager = new DynamicCorsManager();

/**
 * Log domain access
 */
export function logDomainAccess(logger: any, req: any, allowed: boolean): void {
  const origin = req.headers.origin;
  const userAgent = req.headers['user-agent'];
  const ip = req.ip || req.connection.remoteAddress;
  
  logger.info('Domain Access:', {
    origin,
    allowed,
    ip,
    userAgent,
    timestamp: new Date().toISOString()
  });
}
