import express from 'express';
import cors from 'cors';
import { UniversalCipherBreaker } from './universalBreaker.js';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize the cipher breaker
const breaker = new UniversalCipherBreaker();

// Helper function to format keys
function formatKey(result) {
    switch (result.method) {
        case 'Caesar':
            return `Shift ${result.key}`;
        case 'Rail Fence':
            return `${result.key} rails`;
        case 'Vigenère':
            return `"${result.key}"`;
        default:
            return String(result.key);
    }
}

// API endpoint for breaking ciphers
app.post('/api/break-cipher', async (req, res) => {
    try {
        const { ciphertext } = req.body;
        
        if (!ciphertext) {
            return res.status(400).json({
                error: 'Missing ciphertext in request body'
            });
        }

        // Get all results from the cipher breaker
        const results = await breaker.breakCipher(ciphertext);
        
        // Ensure results is an array
        const resultsArray = Array.isArray(results) ? results : [results];
        
        // Format the final analysis results
        const finalAnalysis = resultsArray.map((result, index) => ({
            rank: index + 1,
            method: `${result.method} Cipher`,
            key: formatKey(result),
            confidence: `${(result.normalizedScore * 100).toFixed(1)}%`,
            rawScore: result.rawScore.toFixed(2),
            validWords: result.additionalInfo?.validWordPercentage 
                ? `${result.additionalInfo.validWordPercentage.toFixed(1)}%` 
                : undefined,
            decryptedText: result.decrypted
        }));

        // Format the response while maintaining the original structure
        const response = {
            success: true,
            results: resultsArray.map(result => ({
                method: result.method,
                key: result.key,
                decrypted: result.decrypted,
                rawScore: result.rawScore,
                normalizedScore: result.normalizedScore,
                additionalInfo: {
                    ...result.additionalInfo,
                    validWordPercentage: result.additionalInfo?.validWordPercentage,
                    shiftValue: result.additionalInfo?.shiftValue,
                    rails: result.additionalInfo?.rails
                }
            })),
            finalAnalysis: {
                title: "Final Analysis Results",
                subtitle: "Ranked by confidence score",
                candidates: finalAnalysis
            }
        };

        res.json(response);

    } catch (error) {
        console.error('Error processing cipher:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Cipher breaking server running on port ${port}`);
}); 
