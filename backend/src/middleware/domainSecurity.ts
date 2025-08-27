import { Request, Response, NextFunction } from 'express';
import { corsManager, detectDomainFromRequest, logDomainAccess } from '../utils/network';
import { logger } from '../utils/logger';

/**
 * Domain Access Logger Middleware
 */
export const domainLogger = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  const detectedDomain = detectDomainFromRequest(req);
  
  if (origin || detectedDomain) {
    const domain = origin || detectedDomain;
    const isAllowed = corsManager.isAllowed(domain || '');
    
    // Log Access
    logDomainAccess(logger, req, isAllowed);
    
    // Auto-learn new domain in development environment
    if (process.env.NODE_ENV === 'development' && domain && !isAllowed) {
      logger.info(`Auto-learning new domain in development: ${domain}`);
      corsManager.addDomain(domain);
    }
  }
  
  next();
};

/**
 * Dynamic CORS Preflight Middleware
 */
export const dynamicCorsCheck = (req: Request, res: Response, next: NextFunction) => {
  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin;
    
    if (origin && corsManager.isAllowed(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.header('Access-Control-Allow-Credentials', 'true');
      return res.status(200).end();
    }
  }
  
  next();
};

/**
 * Security Headers Middleware
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;

  // Set Content Security Policy
  if (origin && corsManager.isAllowed(origin)) {
    res.header('Content-Security-Policy', `default-src 'self' ${origin}; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'`);
  }
  
  next();
};
