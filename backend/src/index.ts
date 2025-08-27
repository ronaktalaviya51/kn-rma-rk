import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { domainLogger, dynamicCorsCheck, securityHeaders } from './middleware/domainSecurity';
import { logger } from './utils/logger';
import { generateAllowedOrigins, logNetworkInfo, corsManager, detectDomainFromRequest, logDomainAccess } from './utils/network';
import rmaRoutes from './routes/rmaRoutes';
import authRoutes from './routes/authRoutes';
import uploadRoutes from './routes/uploadRoutes';
import corsRoutes from './routes/corsRoutes';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(limiter);
app.use(helmet());
app.use(compression());
app.use(domainLogger);
app.use(dynamicCorsCheck);
app.use(securityHeaders);

// Dynamically generate allowed origin list based on network CORS origins
const allowedOrigins = generateAllowedOrigins([8080, 3000]);

// Add automatically detected IPs to CORS manager
allowedOrigins.forEach(origin => corsManager.addDomain(origin));

// Add custom domains from environment variables
if (process.env.ALLOWED_DOMAINS) {
  const customDomains = process.env.ALLOWED_DOMAINS.split(',').map(s => s.trim());
  customDomains.forEach(domain => corsManager.addDomain(domain));
}

app.use(cors({
  origin: function (origin, callback) {
    // Log request origin
    const requestInfo = {
      origin: origin,
      timestamp: new Date().toISOString(),
    };

    // If there is no origin (e.g., mobile apps, Postman), allow the request
    if (!origin) {
      logger.info("CORS: No origin header, allowing request");
      callback(null, true);
      return;
    }

    // Check if the origin is in the allowed list
    if (corsManager.isAllowed(origin)) {
      logger.info(`CORS: Allowed origin: ${origin}`);
      callback(null, true);
      return;
    }

    // Development mode has more relaxed settings
    if (process.env.NODE_ENV === "development") {
      logger.info(`CORS: Development mode, allowing origin: ${origin}`);
      // Dynamically learn new domain
      corsManager.learnDomain(origin, requestInfo);
      callback(null, true);
      return;
    }

    // Strict checks in production environment
    logger.warn(`CORS: Blocked origin: ${origin}`);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rma', rmaRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/cors', corsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);

  // Log network information
  logNetworkInfo(logger);
});

export default app;