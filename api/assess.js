const express = require('express');
const router = express.Router();

// Input validation middleware
const validateAssessmentInput = (req, res, next) => {
  const requiredFields = ['age', 'gender', 'smoke', 'exercise'];
  const missingFields = requiredFields.filter(field => !req.body[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: 'Missing required fields',
      missingFields
    });
  }

  if (isNaN(req.body.age) || req.body.age < 18 || req.body.age > 120) {
    return res.status(400).json({
      error: 'Invalid age value',
      message: 'Age must be a number between 18 and 120'
    });
  }

  next();
};

router.post('/', validateAssessmentInput, (req, res) => {
  try {
    const data = req.body;
    let score = 0;

    // Age (validated)
    const age = parseInt(data.age);
    if (age < 30) score += 1;
    else if (age < 50) score += 2;
    else score += 3;

    // Gender (male typically has higher risk)
    if (data.gender === 'male') score += 1;

    // Lifestyle factors
    if (data.smoke === 'Yes') score += 3;
    
    // Exercise scoring
    if (data.exercise === 'Never') score += 3;
    else if (data.exercise === '1-2 times') score += 1;

    // Health conditions (safe handling)
    if (Array.isArray(data.conditions)) {
      score += data.conditions.length * 2;
    }

    // Mental health factors
    const stressLevel = parseInt(data.stress) || 5;
    const wellbeingLevel = parseInt(data.mentalWellbeing) || 5;
    
    score += stressLevel > 7 ? 2 : 0;
    score += wellbeingLevel < 5 ? 2 : 0;
    if (data.mentalSupport === 'Yes') score += 1;

    // Daily habits
    if (['Never', 'Rarely'].includes(data.relaxation)) score += 2;
    if (data.screenTime === 'More than 6 hours') score += 2;

    // Risk assessment
    const { riskCategory, recommendations } = calculateRisk(score);

    res.json({ 
      success: true,
      riskCategory,
      recommendations,
      score
    });

  } catch (error) {
    console.error('Assessment error:', error);
    res.status(500).json({ 
      error: 'Assessment failed',
      message: error.message 
    });
  }
});

function calculateRisk(score) {
  if (score <= 5) {
    return {
      riskCategory: 'Very Low Risk',
      recommendations: [
        'Maintain your current healthy lifestyle!',
        'Continue with regular health checkups.'
      ]
    };
  } else if (score <= 10) {
    return {
      riskCategory: 'Low Risk',
      recommendations: [
        'Consider adding more physical activity to your routine.',
        'Maintain a balanced diet with plenty of fruits and vegetables.',
        'Practice stress management techniques.'
      ]
    };
  } else if (score <= 15) {
    return {
      riskCategory: 'Moderate Risk',
      recommendations: [
        'Increase your weekly exercise frequency.',
        'Limit screen time and take regular breaks.',
        'Consider consulting a health professional for a checkup.',
        'Practice mindfulness or meditation.'
      ]
    };
  } else if (score <= 20) {
    return {
      riskCategory: 'High Risk',
      recommendations: [
        'Quit smoking if applicable and limit unhealthy habits.',
        'Schedule a comprehensive health checkup soon.',
        'Establish a regular exercise routine (3-5 times weekly).',
        'Consider professional mental health support if needed.'
      ]
    };
  } else {
    return {
      riskCategory: 'Very High Risk',
      recommendations: [
        'Consult a healthcare professional immediately for evaluation.',
        'Implement significant lifestyle changes with professional guidance.',
        'Prioritize stress reduction and mental health support.',
        'Establish regular medical follow-ups for monitoring.'
      ]
    };
  }
}

module.exports = router;
