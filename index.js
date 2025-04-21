const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enhanced CORS configuration
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'Healthy',
    version: '1.0.1',
    timestamp: new Date().toISOString()
  });
});

// Assessment endpoint
app.post('/api/assess', (req, res) => {
  console.log('Received assessment request:', req.body);
  
  try {
    const {
      age, gender, smoke, exercise, stress, 
      mentalWellbeing, anxiety, sleep, mentalSupport,
      relaxation, screenTime, social, conditions, mentalIssues
    } = req.body;

    // Validate required fields
    if (!age || isNaN(age) || age < 18 || age > 120) {
      return res.status(400).json({ error: 'Valid age (18-120) is required' });
    }

    let score = 0;

    // Age scoring
    if (age < 30) score += 1;
    else if (age < 50) score += 2;
    else score += 3;

    // Gender scoring
    if (gender === 'male') score += 1;

    // Lifestyle factors
    if (smoke === 'yes') score += 3;
    if (exercise === 'never') score += 3;
    else if (exercise === '1-2') score += 1;

    // Physical health
    if (conditions && conditions.length > 0) {
      score += conditions.length * 2;
    }

    // Enhanced mental health scoring
    score += calculateMentalHealthScore(stress, mentalWellbeing, anxiety, sleep, mentalIssues, mentalSupport);

    // Lifestyle factors
    if (relaxation === 'never' || relaxation === 'rarely') score += 2;
    if (screenTime === '>6') score += 2;
    
    // Social connection scoring
    if (social < 5) score += 2;

    // Risk assessment
    const { riskCategory, recommendations } = calculateRisk(score);

    const result = { 
      success: true,
      riskCategory,
      recommendations,
      score: Math.round(score * 10) / 10 // Round to 1 decimal place
    };

    console.log('Assessment result:', result);
    res.json(result);

  } catch (error) {
    console.error('Assessment error:', error);
    res.status(500).json({ 
      error: 'Assessment failed',
      message: error.message 
    });
  }
});

// Enhanced mental health scoring function
function calculateMentalHealthScore(stress, wellbeing, anxiety, sleep, issues, support) {
  let score = 0;
  
  // Validate inputs
  stress = validateScore(stress, 10);
  wellbeing = validateScore(wellbeing, 10);
  anxiety = validateScore(anxiety, 10);
  sleep = validateScore(sleep, 10);
  
  // Stress scoring (higher = worse)
  if (stress > 7) score += 3;
  else if (stress > 5) score += 2;
  
  // Wellbeing scoring (lower = worse)
  if (wellbeing < 4) score += 3;
  else if (wellbeing < 6) score += 1;
  
  // Anxiety scoring (higher = worse)
  if (anxiety > 7) score += 3;
  else if (anxiety > 5) score += 1;
  
  // Sleep scoring (lower = worse)
  if (sleep < 4) score += 2;
  else if (sleep < 6) score += 1;
  
  // Mental health issues
  if (issues && issues.length > 0) {
    score += issues.length * 1.5;
  }
  
  // Mental health support (lack of support = worse)
  if (support === 'no') score += 1;
  
  return score;
}

function validateScore(value, max) {
  const num = Number(value);
  return isNaN(num) ? max/2 : Math.min(Math.max(num, 0), max);
}

function calculateRisk(score) {
  score = Math.round(score * 10) / 10; // Ensure proper rounding
  
  if (score <= 5) {
    return {
      riskCategory: 'Very Low Risk',
      recommendations: [
        'Maintain your excellent health habits!',
        'Continue regular checkups and health screenings.',
        'Practice mindfulness to maintain mental wellbeing.',
        'Consider volunteering to strengthen social connections.'
      ]
    };
  } else if (score <= 10) {
    return {
      riskCategory: 'Low Risk',
      recommendations: [
        'Increase physical activity to 3-4 times weekly.',
        'Practice stress management techniques like meditation.',
        'Ensure 7-9 hours of quality sleep each night.',
        'Schedule annual health checkups.'
      ]
    };
  } else if (score <= 15) {
    return {
      riskCategory: 'Moderate Risk',
      recommendations: [
        'Consult with a healthcare provider for a checkup.',
        'Reduce screen time and take regular breaks.',
        'Consider talking to a mental health professional.',
        'Improve social connections and support network.',
        'Track your health metrics regularly.'
      ]
    };
  } else if (score <= 20) {
    return {
      riskCategory: 'High Risk',
      recommendations: [
        'Schedule a comprehensive health evaluation immediately.',
        'Quit smoking if applicable and limit unhealthy habits.',
        'Seek professional mental health support.',
        'Establish a regular exercise routine (3-5 times weekly).',
        'Prioritize sleep hygiene and stress reduction.'
      ]
    };
  } else {
    return {
      riskCategory: 'Very High Risk',
      recommendations: [
        'Urgently consult healthcare professionals for evaluation.',
        'Implement significant lifestyle changes with guidance.',
        'Prioritize mental health treatment and support.',
        'Establish regular medical follow-ups for monitoring.',
        'Consider comprehensive wellness program.',
        'Engage with support groups for your specific conditions.'
      ]
    };
  }
}

// Error handling middleware
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
  console.log(`API available at: http://localhost:${PORT}/api/assess`);
  console.log(`Health check at: http://localhost:${PORT}/api/health`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});
