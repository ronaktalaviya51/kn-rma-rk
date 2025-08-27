import express from 'express';
import { corsManager } from '../utils/network';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * Get currently allowed origins domains
 */
router.get('/allowed-domains', (req, res) => {
  try {
    const allowedDomains = corsManager.getAllowedDomains();
    res.json({
      success: true,
      data: {
        domains: allowedDomains,
        count: allowedDomains.length
      }
    });
  } catch (error) {
    logger.error('Error getting allowed domains:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Add allowed domain
 */
router.post('/allowed-domains', (req, res) => {
  try {
    const { domain } = req.body;
    
    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Domain is required'
      });
    }
    
    // Validate domain format
    try {
      new URL(domain);
    } catch {
      return res.status(400).json({
        success: false,
        error: 'Invalid domain format'
      });
    }
    
    corsManager.addDomain(domain);
    
    logger.info(`Added allowed domain: ${domain}`);
    
    res.json({
      success: true,
      message: `Domain ${domain} added successfully`
    });
  } catch (error) {
    logger.error('Error adding allowed domain:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Test if domain is allowed
 */
router.post('/test-domain', (req, res) => {
  try {
    const { domain } = req.body;
    
    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Domain is required'
      });
    }
    
    const isAllowed = corsManager.isAllowed(domain);
    
    res.json({
      success: true,
      data: {
        domain,
        allowed: isAllowed
      }
    });
  } catch (error) {
    logger.error('Error testing domain:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Get domain access statistics
 */
router.get('/domain-stats', (req, res) => {
  try {
    // Here you can fetch statistics from cache or database
    // Temporarily return basic information
    res.json({
      success: true,
      data: {
        totalAllowedDomains: corsManager.getAllowedDomains().length,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error getting domain stats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
