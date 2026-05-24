import brain from 'brain.js';
import fs from 'fs';
import path from 'path';

// Paths
const MODEL_PATH = path.resolve('AI/model/trained_model.json');
const METADATA_PATH = path.resolve('AI/model/metadata.json');

/**
 * Predicts disease based on raw input text using Permissive NLP (Keyword matching)
 * @param {string} rawInput - The user's input message
 */
export function predict(rawInput) {
    if (!fs.existsSync(MODEL_PATH) || !fs.existsSync(METADATA_PATH)) {
        throw new Error('Model or metadata not found. Please run training first.');
    }

    const modelJson = JSON.parse(fs.readFileSync(MODEL_PATH, 'utf8'));
    const metadata = JSON.parse(fs.readFileSync(METADATA_PATH, 'utf8'));

    const net = new brain.NeuralNetwork();
    net.fromJSON(modelJson);

    const normalizedInput = rawInput.toLowerCase();
    
    // NLP Mapping: Map common synonyms to dataset keywords
    const synonymMap = {
        "blood pressure": "bp",
        "pressure": "bp",
        "sugar": "high sugar",
        "glucose": "high sugar",
        "diabetes": "high sugar",
        "diarrhea": "loose motion",
        "loose stool": "loose motion",
        "breathing": "breathing problem",
        "shortness of breath": "breathing problem",
        "stomach ache": "stomach pain",
        "tummy pain": "stomach pain",
        "pain in chest": "chest pain",
        "hurts in chest": "chest pain"
    };

    const input = {};
    metadata.symptoms.forEach(s => {
        const lowerS = s.toLowerCase();
        // 1. Direct match (phrase exists in sentence)
        let matched = normalizedInput.includes(lowerS);
        
        // 2. Synonym match
        if (!matched) {
            Object.entries(synonymMap).forEach(([syn, target]) => {
                if (target === lowerS && normalizedInput.includes(syn)) {
                    matched = true;
                }
            });
        }
        
        input[s] = matched ? 1 : 0;
    });

    // Check if any symptoms were identified
    const identifiedSymptomsCount = Object.values(input).filter(v => v === 1).length;
    if (identifiedSymptomsCount === 0) {
        return []; 
    }

    const output = net.run(input);

    const results = Object.entries(output)
        .map(([disease, confidence]) => ({ disease, confidence }))
        .sort((a, b) => b.confidence - a.confidence);

    return results;
}
