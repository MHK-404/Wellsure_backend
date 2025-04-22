const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration
const allowedOrigins = [
  'https://lively-dune-0e6a62f03.6.azurestaticapps.net',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Assessment Endpoint
app.post('/api/assess', (req, res) => {
  console.log('Received assessment request:', req.body);
  
  try {
    // Validate required fields
    if (!req.body.age || !req.body.gender) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['age', 'gender']
      });
    }

    // Calculate score
    let score = 0;
    
    // Age scoring
    const age = parseInt(req.body.age);
    if (age < 30) score += 1;
    else if (age < 50) score += 2;
    else score += 3;

    // Gender scoring
    if (req.body.gender === 'male') score += 1;

    // Lifestyle factors
    if (req.body.smoke === 'yes') score += 3;
    if (req.body.exercise === 'never') score += 3;
    else if (req.body.exercise === '1-2') score += 1;

    // Mental health factors
    const stress = parseInt(req.body.stress) || 5;
    const wellbeing = parseInt(req.body.mentalWellbeing) || 5;
    
    if (stress > 7) score += 3;
    else if (stress > 5) score += 2;
    
    if (wellbeing < 4) score += 3;
    else if (wellbeing < 6) score += 1;

    // Determine risk category
    let riskCategory, recommendations;
    
    if (score <= 5) {
      riskCategory = 'Very Low Risk';
      recommendations = [
        'Maintain your current healthy lifestyle',
        'Continue regular health checkups'
      ];
    } else if (score <= 10) {
      riskCategory = 'Low Risk';
      recommendations = [
        'Increase physical activity',
        'Practice stress management'
      ];
    } else if (score <= 15) {
      riskCategory = 'Moderate Risk';
      recommendations = [
        'Consult with a healthcare provider',
        'Reduce screen time'
      ];
    } else {
      riskCategory = 'High Risk';
      recommendations = [
        'Schedule a health evaluation',
        'Seek professional support'
      ];
    }

    // Send response
    res.json({
      success: true,
      riskCategory,
      recommendations,
      score: Math.round(score * 10) / 10
    });

  } catch (error) {
    console.error('Assessment error:', error);
    res.status(500).json({ 
      error: 'Assessment failed',
      message: error.message 
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});
