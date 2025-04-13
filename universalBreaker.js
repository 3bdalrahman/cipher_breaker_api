/**
 * Universal Cipher Breaker - Integration Module
 * Combines Vigenère, Caesar, and Rail Fence cipher breaking capabilities
 * into a unified system that automatically detects and decrypts ciphered text.
 */

import { VigenereBreaker } from './vigenere.js';
import { CipherBreaker } from './combine caesar and rail fence.js';
import fs from 'node:fs';
import path from 'path';

// Remove the hardcoded CIPHERTEXT constant
// const CIPHERTEXT = "Kw ft ail cewiaqvi tmcyqlgerxtt bq jyn, am etfrt bb qp tgeamz, vyyi ba, ja jm raivizlv mpm qibtk wn vyc axbbgiq dy bpg rjeaijgk, rwtb vqk y lhzl efsaw jm orbt hcb.";

export class UniversalCipherBreaker {
    constructor() {
        // Load Words.json dictionary first so we can pass it to the breakers
        try {
            const wordsPath = path.resolve('./Words.json');
            const wordsContent = fs.readFileSync(wordsPath, 'utf8');
            const wordsData = JSON.parse(wordsContent);
            
            // Extract the commonWords array from the JSON structure
            if (wordsData.commonWords && Array.isArray(wordsData.commonWords)) {
                this.wordsDictionary = wordsData.commonWords;
                console.log(`Loaded ${this.wordsDictionary.length} words from Words.json`);
            } else {
                throw new Error('Words.json must contain a commonWords array');
            }
        } catch (error) {
            console.error(`Error loading Words.json: ${error.message}`);
            this.wordsDictionary = null;
        }
        
        // Initialize breakers with the dictionary if available
        this.vigenereBreaker = new VigenereBreaker(this.wordsDictionary);
        this.classicBreaker = new CipherBreaker(this.wordsDictionary);
        
        // Create a Set for word validation
        if (this.wordsDictionary) {
            this.wordsDictionarySet = new Set(this.wordsDictionary.map(word => word.toUpperCase()));
        }
        
        // Define validity thresholds for simple ciphers
        this.thresholds = {
            confidenceThreshold: 0.9,  // 90% confidence threshold for immediate success
            caesar: 0.7,      // Normalized score threshold for Caesar cipher
            railFence: 0.65,  // Normalized score threshold for Rail Fence cipher
            vigenere: 0.5,    // Normalized score threshold for Vigenère cipher
        };
        
        // Adjusted scoring weights to favor simpler methods when they produce valid results
        this.scoreWeights = {
            caesar: 1.2,      // Base priority for Caesar
            railFence: 0.8,   // Slightly lower weight for Rail Fence
            vigenere: 0.7     // Lowest weight for Vigenère
        };
    }

    normalizeScore(method, rawScore, options = {}) {
        // Handle invalid inputs
        if (typeof rawScore !== 'number' || isNaN(rawScore)) {
            console.debug(`Warning: Invalid raw score for ${method}. Defaulting to 0.`);
            return 0;
        }

        try {
            // Base normalization (scale from typical range to 0-1)
            let normalizedScore = Math.max(0, rawScore) / 1000;
            
            // Apply method-specific weights
            normalizedScore *= (this.scoreWeights[method] || 1.0);

            // Word validation bonus
            if (options.validWordPercentage) {
                const wordScore = Math.max(0, Math.min(100, options.validWordPercentage)) / 100;
                normalizedScore *= (0.3 + 0.7 * wordScore);
            }

            // Structure preservation bonus
            if (options.preservesSpaces) {
                normalizedScore *= 1.2;
            }

            return Math.max(0, Math.min(1, normalizedScore));
        } catch (error) {
            console.debug(`Error normalizing score for ${method}:`, error);
            return 0;
        }
    }

    /**
     * Validates decrypted text by calculating the ratio of valid English words
     * @param {string} text - Decrypted text to validate
     * @returns {Object} - Object containing confidence score and valid/invalid word counts
     */
    validateText(text) {
        if (!text) return { confidence: 0, validWords: 0, totalWords: 0, invalidWords: [] };
        
        // Extract words from text, ignoring punctuation and case
        const words = text.split(/\s+/).filter(word => word.length > 0).map(word => {
            return word.replace(/[^a-zA-Z]/g, '').toUpperCase();
        }).filter(word => word.length > 0);
        
        if (words.length === 0) return { confidence: 0, validWords: 0, totalWords: 0, invalidWords: [] };
        
        // Determine which dictionary to use
        let dictionary;
        if (this.wordsDictionarySet && this.wordsDictionarySet.size > 0) {
            // Use Words.json if available
            dictionary = this.wordsDictionarySet;
        } else {
            // Fallback to combined dictionary from breakers
            dictionary = new Set([
                ...this.vigenereBreaker.commonWords || [],
                ...(this.classicBreaker.commonWords || [])
            ]);
        }
        
        // Count valid words
        const invalidWords = [];
        let validCount = 0;
        
        for (const word of words) {
            if (dictionary.has(word)) {
                validCount++;
            } else {
                invalidWords.push(word);
            }
        }
        
        const confidence = validCount / words.length;
        
        return {
            confidence,
            validWords: validCount,
            totalWords: words.length,
            invalidWords
        };
    }

    /**
     * Main method to break ciphers, prioritizing simpler methods first
     * @param {string} ciphertext - The encrypted text to break
     * @returns {Object} - Decryption result with method, text, confidence, and parameters
     */
    async breakCipher(ciphertext) {
        if (!ciphertext || typeof ciphertext !== 'string') {
            throw new Error('Invalid ciphertext provided');
        }

        console.log("\n=== Starting Universal Cipher Analysis ===");
        console.log(`Input text: "${ciphertext}"\n`);
        
        const results = [];
        
        // Step 1: Try Caesar cipher first (simplest approach)
        console.log("ATTEMPT 1: Caesar cipher decryption...");
        try {
            const caesarResult = this.classicBreaker.breakCaesar(ciphertext);
            
            if (caesarResult && caesarResult.text) {
                // Validate the Caesar result
                const validation = this.validateText(caesarResult.text);
                
                // Add result to our collection
                results.push({
                    method: 'Caesar',
                    key: caesarResult.shift.toString(),
                    decrypted: caesarResult.text,
                    rawScore: caesarResult.score,
                    confidence: validation.confidence,
                    additionalInfo: {
                        shiftValue: caesarResult.shift,
                        validWords: validation.validWords,
                        totalWords: validation.totalWords,
                        invalidWords: validation.invalidWords
                    }
                });
                
                console.log(`Caesar analysis complete:`);
                console.log(`  Shift: ${caesarResult.shift}`);
                console.log(`  Raw score: ${caesarResult.score.toFixed(2)}`);
                console.log(`  Confidence: ${(validation.confidence * 100).toFixed(1)}% (${validation.validWords}/${validation.totalWords} valid words)`);
                console.log(`  Sample: "${caesarResult.text.substring(0, 50)}..."\n`);
                
                // If confidence meets threshold, return immediately
                if (validation.confidence >= this.thresholds.confidenceThreshold) {
                    console.log(`✓ Caesar decryption successful with ${(validation.confidence * 100).toFixed(1)}% confidence!`);
                    
                    return {
                        success: true,
                        method: 'Caesar',
                        decrypted: caesarResult.text,
                        confidence: validation.confidence,
                        key: caesarResult.shift.toString(),
                        params: { shift: caesarResult.shift },
                        details: validation
                    };
                } else {
                    console.log(`✗ Caesar confidence ${(validation.confidence * 100).toFixed(1)}% below threshold ${(this.thresholds.confidenceThreshold * 100).toFixed(1)}%, trying next method`);
                }
            }
        } catch (error) {
            console.log("Warning: Caesar decryption failed:", error.message);
        }

        // Step 2: Try Rail Fence if Caesar didn't meet threshold
        console.log("ATTEMPT 2: Rail Fence decryption...");
        try {
            const railFenceResult = this.classicBreaker.breakRailFence(ciphertext);
            
            if (railFenceResult && railFenceResult.text) {
                // Validate the Rail Fence result
                const validation = this.validateText(railFenceResult.text);
                
                // Add result to our collection
                results.push({
                    method: 'Rail Fence',
                    key: railFenceResult.rails.toString(),
                    decrypted: railFenceResult.text,
                    rawScore: railFenceResult.score,
                    confidence: validation.confidence,
                    additionalInfo: {
                        rails: railFenceResult.rails,
                        validWords: validation.validWords,
                        totalWords: validation.totalWords,
                        invalidWords: validation.invalidWords
                    }
                });
                
                console.log(`Rail Fence analysis complete:`);
                console.log(`  Rails: ${railFenceResult.rails}`);
                console.log(`  Raw score: ${railFenceResult.score.toFixed(2)}`);
                console.log(`  Confidence: ${(validation.confidence * 100).toFixed(1)}% (${validation.validWords}/${validation.totalWords} valid words)`);
                console.log(`  Sample: "${railFenceResult.text.substring(0, 50)}..."\n`);
                
                // If confidence meets threshold, return immediately
                if (validation.confidence >= this.thresholds.confidenceThreshold) {
                    console.log(`✓ Rail Fence decryption successful with ${(validation.confidence * 100).toFixed(1)}% confidence!`);
                    
                    return {
                        success: true,
                        method: 'Rail Fence',
                        decrypted: railFenceResult.text,
                        confidence: validation.confidence,
                        key: railFenceResult.rails.toString(),
                        params: { rails: railFenceResult.rails },
                        details: validation
                    };
                } else {
                    console.log(`✗ Rail Fence confidence ${(validation.confidence * 100).toFixed(1)}% below threshold ${(this.thresholds.confidenceThreshold * 100).toFixed(1)}%, trying next method`);
                }
            }
        } catch (error) {
            console.log("Warning: Rail Fence decryption failed:", error.message);
        }

        // Step 3: Try Vigenère as last resort
        console.log("ATTEMPT 3: Vigenère decryption...");
        try {
            const vigenereResult = await this.vigenereBreaker.breakVigenere(ciphertext);
            
            if (vigenereResult && vigenereResult.decrypted) {
                // For Vigenère, use the validation from the breaker if available, otherwise validate ourselves
                let validation;
                if (vigenereResult.validation && typeof vigenereResult.validation.percentage === 'number') {
                    validation = {
                        confidence: vigenereResult.validation.percentage / 100,
                        validWords: Math.round(vigenereResult.validation.percentage * 0.01 * vigenereResult.decrypted.split(/\s+/).length),
                        totalWords: vigenereResult.decrypted.split(/\s+/).length,
                        invalidWords: vigenereResult.validation.invalidWords || []
                    };
                } else {
                    validation = this.validateText(vigenereResult.decrypted);
                }
                
                // Add result to our collection
                results.push({
                    method: 'Vigenère',
                    key: vigenereResult.key,
                    decrypted: vigenereResult.decrypted,
                    rawScore: vigenereResult.score,
                    confidence: validation.confidence,
                    additionalInfo: {
                        validWords: validation.validWords,
                        totalWords: validation.totalWords,
                        invalidWords: validation.invalidWords
                    }
                });
                
                console.log(`Vigenère analysis complete:`);
                console.log(`  Key: ${vigenereResult.key}`);
                console.log(`  Raw score: ${vigenereResult.score.toFixed(2)}`);
                console.log(`  Confidence: ${(validation.confidence * 100).toFixed(1)}% (${validation.validWords}/${validation.totalWords} valid words)`);
                console.log(`  Sample: "${vigenereResult.decrypted.substring(0, 50)}..."\n`);
                
                // If confidence meets threshold, return immediately
                if (validation.confidence >= this.thresholds.confidenceThreshold) {
                    console.log(`✓ Vigenère decryption successful with ${(validation.confidence * 100).toFixed(1)}% confidence!`);
                    
                    return {
                        success: true,
                        method: 'Vigenère',
                        decrypted: vigenereResult.decrypted,
                        confidence: validation.confidence,
                        key: vigenereResult.key,
                        params: { key: vigenereResult.key },
                        details: validation
                    };
                } else {
                    console.log(`✗ Vigenère confidence ${(validation.confidence * 100).toFixed(1)}% below threshold ${(this.thresholds.confidenceThreshold * 100).toFixed(1)}%`);
                }
            }
        } catch (error) {
            console.log("Warning: Vigenère decryption failed:", error.message);
        }

        // Fallback: If no method reached the confidence threshold, return the best result
        console.log("\n=== No method reached the confidence threshold ===");
        console.log("Returning the best scoring result from all attempts.");
        
        if (results.length === 0) {
            console.log("No valid decryption results found.");
            throw new Error('No valid decryption results found');
        }
        
        // Sort results by confidence score
        results.sort((a, b) => b.confidence - a.confidence);
        const bestResult = results[0];
        
        console.log(`\nBest result found:`);
        console.log(`  Method: ${bestResult.method}`);
        console.log(`  Key: ${bestResult.key}`);
        console.log(`  Confidence: ${(bestResult.confidence * 100).toFixed(1)}%`);
        console.log(`  Decrypted text: "${bestResult.decrypted.substring(0, 100)}${bestResult.decrypted.length > 100 ? '...' : ''}"`);
        
        // Return in standardized format
        return {
            success: false,  // Indicates confidence threshold wasn't met
            method: bestResult.method,
            decrypted: bestResult.decrypted,
            confidence: bestResult.confidence,
            key: bestResult.key,
            params: bestResult.method === 'Caesar' ? { shift: parseInt(bestResult.key) } :
                    bestResult.method === 'Rail Fence' ? { rails: parseInt(bestResult.key) } :
                    { key: bestResult.key },
            details: {
                validWords: bestResult.additionalInfo.validWords,
                totalWords: bestResult.additionalInfo.totalWords,
                invalidWords: bestResult.additionalInfo.invalidWords
            }
        };
    }

    displayResults(results) {
        console.log("\n=== Final Analysis Results ===");
        console.log("Ranked by confidence score:\n");

        results.forEach((result, index) => {
            console.log(`${index + 1}. ${result.method} Cipher`);
            console.log(`   Key: ${this.formatKey(result)}`);
            console.log(`   Confidence: ${(result.normalizedScore * 100).toFixed(1)}%`);
            console.log(`   Raw Score: ${result.rawScore.toFixed(2)}`);
            
            if (result.additionalInfo?.validWordPercentage) {
                console.log(`   Valid Words: ${result.additionalInfo.validWordPercentage.toFixed(1)}%`);
            }
            
            console.log(`   Decrypted Text:`);
            console.log(`   "${result.decrypted}"`);
            console.log();
        });
    }

    formatKey(result) {
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
}

// Remove the main function and its execution
// async function main() { ... }
// main(); 