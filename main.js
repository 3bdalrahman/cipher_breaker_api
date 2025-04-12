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

        // Get result from the cipher breaker
        const result = await breaker.breakCipher(ciphertext);
        
        // Format the response based on the new structure
        const response = {
            success: result.success,
            result: {
                method: result.method,
                key: formatKey({
                    method: result.method,
                    key: result.key
                }),
                decrypted: result.decrypted,
                confidence: result.confidence,
                params: result.params,
                additionalInfo: {
                    validWords: result.details?.validWords || 0,
                    totalWords: result.details?.totalWords || 0,
                    validWordPercentage: result.confidence * 100
                }
            }
        };

        // Add final analysis for UI display
        response.finalAnalysis = {
            title: "Final Analysis Results",
            subtitle: result.success ? 
                "Decryption successful with high confidence" : 
                "Best possible decryption (below confidence threshold)",
            candidates: [{
                rank: 1,
                method: `${result.method} Cipher`,
                key: formatKey({
                    method: result.method,
                    key: result.key
                }),
                confidence: `${(result.confidence * 100).toFixed(1)}%`,
                validWords: `${result.details?.validWords || 0}/${result.details?.totalWords || 0}`,
                validWordPercentage: `${(result.confidence * 100).toFixed(1)}%`,
                decryptedText: result.decrypted
            }]
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
