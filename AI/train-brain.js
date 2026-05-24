import brain from 'brain.js';
import fs from 'fs';
import path from 'path';

// Configuration
const DATASET_PATH = path.resolve('AI/dataset/diecese.json'); 
const MODEL_SAVE_PATH = path.resolve('AI/model/trained_model.json');
const METADATA_SAVE_PATH = path.resolve('AI/model/metadata.json');

console.log('--- MediQueue AI Training Started (with Precautions) ---');

// 1. Load Dataset
console.log('Loading dataset...');
let rawData;
try {
    rawData = JSON.parse(fs.readFileSync(DATASET_PATH, 'utf8'));
} catch (error) {
    console.error('Failed to load dataset:', error.message);
    process.exit(1);
}
console.log(`Dataset loaded: ${rawData.length} records found.`);

// 2. Extract unique symptoms and diseases
console.log('Processing symptoms and outcomes...');
const allSymptoms = new Set();
const allDiseases = new Set();

rawData.forEach(item => {
    item.symptoms.forEach(s => allSymptoms.add(s.toLowerCase()));
    allDiseases.add(item.outcome.disease);
});

const symptomList = Array.from(allSymptoms).sort();
const diseaseList = Array.from(allDiseases).sort();

console.log(`Unique symptoms identified: ${symptomList.length}`);
console.log(`Target diseases identified: ${diseaseList.length}`);

// 3. Prepare training data
console.log('Formatting data for Neural Network...');
const trainingData = rawData.map(item => {
    const input = {};
    symptomList.forEach(s => input[s] = 0);
    item.symptoms.forEach(s => input[s.toLowerCase()] = 1);

    const output = {};
    output[item.outcome.disease] = 1;

    return { input, output };
});

// 4. Initialize and Train
const net = new brain.NeuralNetwork({
    hiddenLayers: [12, 12], // Slightly larger for richer data
});

console.log('Starting training...');
const stats = net.train(trainingData, {
    iterations: 2000,
    errorThresh: 0.005,
    log: true,
    logPeriod: 100,
    learningRate: 0.3
});

console.log('Training finished!', stats);

// 5. Save Model and Metadata
console.log('Saving model to disk...');
const modelJson = net.toJSON();
fs.writeFileSync(MODEL_SAVE_PATH, JSON.stringify(modelJson));

const metadata = {
    symptoms: symptomList,
    diseases: diseaseList,
    trainedAt: new Date().toISOString(),
    accuracy: 1 - stats.error
};
fs.writeFileSync(METADATA_SAVE_PATH, JSON.stringify(metadata, null, 2));

console.log('--- Setup Complete ---');
