import fs from 'fs';
import path from 'path';

// Load datasets
const DIECESE_PATH = path.resolve('AI/dataset/diecese.json');
const PRECAUTIONS_PATH = path.resolve('AI/dataset/Precautions.json');

let dieceseData = [];
let precautionsData = [];

try {
    dieceseData = JSON.parse(fs.readFileSync(DIECESE_PATH, 'utf8'));
    precautionsData = JSON.parse(fs.readFileSync(PRECAUTIONS_PATH, 'utf8'));
} catch (error) {
    console.error('AI Dataset loading failed:', error.message);
}

/**
 * Enhanced Medical AI Logic
 * Uses pattern matching and scoring across the 40k+ records dataset
 */
export const diagnoseSymptoms = async (req, res) => {
    try {
        const { symptoms } = req.body; // Array of symptoms or a string
        
        if (!symptoms || symptoms.length === 0) {
            return res.status(400).json({ success: false, message: 'Please provide symptoms.' });
        }

        const inputSymptoms = Array.isArray(symptoms) 
            ? symptoms.map(s => s.toLowerCase()) 
            : symptoms.toLowerCase().split(/[ ,]+/).filter(s => s.length > 2);

        // 1. Scoring Logic
        const scores = {};
        
        dieceseData.forEach(item => {
            let matchCount = 0;
            item.symptoms.forEach(s => {
                if (inputSymptoms.some(input => s.toLowerCase().includes(input) || input.includes(s.toLowerCase()))) {
                    matchCount++;
                }
            });

            if (matchCount > 0) {
                const diseaseName = item.disease;
                const score = matchCount / item.symptoms.length; // Normalize score
                
                if (!scores[diseaseName] || score > scores[diseaseName].score) {
                    scores[diseaseName] = {
                        disease: diseaseName,
                        score: score,
                        matchedSymptoms: matchCount,
                        severity: "Unknown" // The dataset doesn't seem to have severity
                    };
                }
            }
        });

        // Helper to maps diseases to doctors
        const getDoctorForDisease = (disease) => {
            const doctorsMap = {
                'Malaria': 'Physician',
                'Dengue': 'Physician',
                'Depression': 'Psychiatrist',
                'Heart': 'Cardiology',
                'Chest pain': 'Cardiology',
                'Acne': 'Skin',
                'Skin rash': 'Skin',
                'Dental Caries': 'Dental',
                'Gum Disease': 'Dental',
                'Eye': 'Eyes',
                'Migraine': 'Physician'
            };
            for (let key in doctorsMap) {
                if (disease.includes(key)) return doctorsMap[key];
            }
            return 'General Physician';
        };

        // 2. Sort and pick top result
        const sortedResults = Object.values(scores).sort((a, b) => b.score - a.score);

        if (sortedResults.length === 0) {
            return res.json({ 
                success: true, 
                diagnosis: {
                    disease: 'Unknown Condition',
                    severity: 'Low',
                    message: "I couldn't find a direct match for those symptoms. Please consult a General Physician."
                }
            });
        }

        const topResult = sortedResults[0];

        // 3. Find Precautions
        const precautionEntry = precautionsData.find(p => p.disease.toLowerCase() === topResult.disease.toLowerCase());

        res.json({
            success: true,
            diagnosis: {
                ...topResult,
                recommendedDoctor: getDoctorForDisease(topResult.disease),
                confidence: Math.round(topResult.score * 100),
                precautions: precautionEntry ? precautionEntry.precautions : [],
                doctorAdvice: precautionEntry ? precautionEntry.doctor_advice : "Please stay hydrated and rest.",
                waterIntake: precautionEntry ? precautionEntry.recommended_water_intake_liters : "2-3L",
                sleepHours: precautionEntry ? precautionEntry.recommended_sleep_hours : "7-8h",
                diet: precautionEntry ? precautionEntry.diet_type : "Balanced"
            }
        });

    } catch (error) {
        console.error('AI Diagnosis Error:', error);
        res.status(500).json({ success: false, message: 'AI Engine Error' });
    }
};
