const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  const data = req.body;
  let score = 0;

  // Age
  const age = parseInt(data.age);
  if (age < 30) score += 1;
  else if (age < 50) score += 2;
  else score += 3;

  // Smoking & Alcohol
  if (data.smoke === 'Yes') score += 3;
  if (data.alcohol === 'Regularly') score += 2;
  if (data.alcohol === 'Occasionally') score += 1;

  // Chronic conditions
  if (Array.isArray(data.conditions)) {
    score += data.conditions.length > 0 && !data.conditions.includes("none") ? data.conditions.length * 2 : 0;
  }

  // Stress & mental well-being
  score += parseInt(data.stress || 5) > 7 ? 2 : 0;
  score += parseInt(data.mentalWellbeing || 5) < 5 ? 2 : 0;

  if (data.mentalSupport === 'Yes') score += 1;

  // Lifestyle
  if (data.relaxation === 'Never' || data.relaxation === 'Rarely') score += 2;
  if (data.screenTime === 'More than 6 hours') score += 2;

  // Final Risk Category
  let riskCategory = '';
  let recommendations = [];

  if (score <= 5) {
    riskCategory = 'Very Low Risk';
    recommendations = ['Maintain your current lifestyle!', 'Continue regular checkups.'];
  } else if (score <= 10) {
    riskCategory = 'Low Risk';
    recommendations = ['Consider adding light physical activity.', 'Maintain a balanced diet.'];
  } else if (score <= 15) {
    riskCategory = 'Moderate Risk';
    recommendations = ['Engage in more stress-relieving activities.', 'Track your sleep and screen time.', 'Consult your doctor annually.'];
  } else if (score <= 20) {
    riskCategory = 'High Risk';
    recommendations = ['Stop smoking and limit alcohol intake.', 'Schedule a medical and mental health checkup.', 'Increase your physical activity.'];
  } else {
    riskCategory = 'Very High Risk';
    recommendations = [
      'Consult a health professional immediately.',
      'Seek mental health support.',
      'Change your daily habits for healthier alternatives.',
      'Follow up regularly with your doctor.'
    ];
  }

  res.json({ riskCategory, recommendations });
});

module.exports = router;
