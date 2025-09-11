import express from 'express';

const router = express.Router();

// Get system configuration
router.get('/system', (req, res) => {
  res.json({
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    features: {
      aiAnalysis: !!process.env.OPENAI_API_KEY,
      scheduling: true,
      screenshots: true,
      mobileTest: true
    },
    limits: {
      maxProductPages: 50,
      maxTimeout: 60000,
      maxRetries: 5
    }
  });
});

// Update system configuration
router.put('/system', (req, res) => {
  // In production, this would update environment variables or config files
  res.json({ message: 'Configuration updated successfully' });
});

export default router;