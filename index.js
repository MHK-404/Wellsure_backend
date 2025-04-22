module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    if (req.method === 'POST') {
        try {
            const userData = req.body;
            
            // Validate input
            if (!userData || !userData.age || !userData.gender || !userData.weight || !userData.height) {
                context.res = {
                    status: 400,
                    body: "Please provide all required information: age, gender, weight, and height."
                };
                return;
            }

            // Calculate BMI
            const heightInMeters = userData.height / 100;
            const bmi = userData.weight / (heightInMeters * heightInMeters);

            // Risk calculation algorithm
            let riskScore = 0;
            
            // Age factor
            if (userData.age < 30) riskScore += 1;
            else if (userData.age < 50) riskScore += 2;
            else riskScore += 3;

            // BMI factor
            if (bmi < 18.5) riskScore += 2; // Underweight
            else if (bmi < 25) riskScore += 1; // Normal
            else if (bmi < 30) riskScore += 2; // Overweight
            else riskScore += 3; // Obese

            // Chronic diseases factor
            if (userData.chronicDiseases && userData.chronicDiseases.length > 0) {
                riskScore += userData.chronicDiseases.length * 2;
            }

            // Mental health factors
            if (userData.stressLevel && userData.stressLevel > 5) {
                riskScore += Math.min(3, userData.stressLevel - 5);
            }
            if (userData.mentalHealthIssues && userData.mentalHealthIssues.length > 0) {
                riskScore += userData.mentalHealthIssues.length * 1.5;
            }

            // Environment factors
            if (userData.environmentFactors) {
                if (userData.environmentFactors.includes('pollution')) riskScore += 2;
                if (userData.environmentFactors.includes('unsafe')) riskScore += 2;
                if (userData.environmentFactors.includes('sedentary')) riskScore += 1;
            }

            // Determine risk category
            let riskCategory, recommendations = [];
            
            if (riskScore <= 5) {
                riskCategory = "Very Low";
                recommendations = [
                    "Maintain your healthy lifestyle!",
                    "Continue regular health check-ups.",
                    "Keep up with physical activity and balanced diet."
                ];
            } else if (riskScore <= 10) {
                riskCategory = "Low";
                recommendations = [
                    "Monitor your health regularly.",
                    "Consider small lifestyle improvements.",
                    "Manage stress through relaxation techniques."
                ];
            } else if (riskScore <= 15) {
                riskCategory = "Moderate";
                recommendations = [
                    "Consult with a healthcare provider for a check-up.",
                    "Consider dietary improvements and regular exercise.",
                    "Address any chronic conditions with professional help."
                ];
            } else if (riskScore <= 20) {
                riskCategory = "High";
                recommendations = [
                    "Seek medical advice as soon as possible.",
                    "Implement significant lifestyle changes.",
                    "Consider stress management programs."
                ];
            } else {
                riskCategory = "Very High";
                recommendations = [
                    "Immediate medical consultation recommended.",
                    "Comprehensive lifestyle changes needed.",
                    "Consider working with health professionals for a care plan."
                ];
            }

            // Add BMI-specific recommendation
            if (bmi < 18.5) {
                recommendations.push("Your BMI suggests underweight - consider nutritional counseling.");
            } else if (bmi >= 25) {
                recommendations.push(`Your BMI (${bmi.toFixed(1)}) suggests ${bmi >= 30 ? 'obesity' : 'overweight'} - consider weight management strategies.`);
            }

            context.res = {
                status: 200,
                body: {
                    riskCategory,
                    riskScore,
                    bmi: bmi.toFixed(1),
                    recommendations
                },
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            };
        } catch (error) {
            context.res = {
                status: 500,
                body: "An error occurred while processing your request.",
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }
    } else {
        context.res = {
            status: 200,
            body: "Please send a POST request to this endpoint with your health data.",
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
};
