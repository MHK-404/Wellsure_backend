const express = require('express');
const router = express.Router();

// Input validation middleware
const validateAssessmentInput = (req, res, next) => {
  const requiredFields = ['age', 'smoke', 'alcohol', 'stress', 'mentalWellbeing'];
  const missingFields = requiredFields.filter(field => !req.body[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: 'Missing required fields',
      missingFields
    });
  }

  if (isNaN(req.body.age) || req.body.age < 1 || req.body.age > 120) {
    return res.status(400).json({
      error: 'Invalid age value',
      message: 'Age must be a number between 1 and 120'
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

    // Lifestyle factors
    if (data.smoke === 'Yes') score += 3;
    if (data.alcohol === 'Regularly') score += 2;
    if (data.alcohol === 'Occasionally') score += 1;

    // Health conditions (safe handling)
    if (Array.isArray(data.conditions)) {
      const validConditions = data.conditions.filter(c => c !== "none");
      score += validConditions.length * 2;
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
        'Maintain your current lifestyle!',
        'Continue regular checkups.'
      ]
    };
  } else if (score <= 10) {
    return {
      riskCategory: 'Low Risk',
      recommendations: [
        'Consider adding light physical activity.',
        'Maintain a balanced diet.'
      ]
    };
  } else if (score <= 15) {
    return {
      riskCategory: 'Moderate Risk',
      recommendations: [
        'Engage in more stress-relieving activities.',
        'Track your sleep and screen time.',
        'Consult your doctor annually.'
      ]
    };
  } else if (score <= 20) {
    return {
      riskCategory: 'High Risk',
      recommendations: [
        'Stop smoking and limit alcohol intake.',
        'Schedule medical and mental health checkups.',
        'Increase physical activity.'
      ]
    };
  } else {
    return {
      riskCategory: 'Very High Risk',
      recommendations: [
        'Consult a health professional immediately.',
        'Seek mental health support.',
        'Change daily habits for healthier alternatives.',
        'Follow up regularly with your doctor.'
      ]
    };
  }
}

module.exports = router;
