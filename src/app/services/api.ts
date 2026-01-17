// API Integration Layer for EcoLens
// This file contains the structure for integrating with DigitalOcean backend,
// Google Gemini API, and ElevenLabs TTS API

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000';
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';
const ELEVENLABS_API_KEY = process.env.VITE_ELEVENLABS_API_KEY || 'YOUR_ELEVENLABS_API_KEY';

export interface GeminiAnalysisRequest {
  image: string; // base64 encoded image
}

export interface GeminiAnalysisResponse {
  objectName: string;
  carbonFootprint: string;
  carbonValue: number;
  lifecycle: string[];
  explanation: string;
  alternatives: {
    name: string;
    benefit: string;
    carbonSavings: string;
  }[];
}

export interface ElevenLabsRequest {
  text: string;
  voice_id?: string; // Optional: Use specific voice
}

/**
 * Analyze image using Google Gemini Vision API
 * 
 * Example Gemini API Prompt:
 * "Identify this object in the image. Analyze its environmental impact including:
 * 1. Carbon footprint in grams CO2e
 * 2. Full product lifecycle stages
 * 3. Detailed explanation of environmental impact
 * 4. Three sustainable alternatives with their carbon savings
 * Return the data in JSON format."
 */
export async function analyzeWithGemini(imageData: string): Promise<GeminiAnalysisResponse> {
  try {
    // OPTION 1: Call your DigitalOcean backend
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageData })
    });

    if (!response.ok) {
      throw new Error('Analysis failed');
    }

    return await response.json();

    // OPTION 2: Direct Gemini API call (if using client-side)
    // const geminiResponse = await fetch(
    //   `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${GEMINI_API_KEY}`,
    //   {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       contents: [{
    //         parts: [
    //           { text: GEMINI_PROMPT },
    //           { inline_data: { mime_type: 'image/jpeg', data: imageData.split(',')[1] } }
    //         ]
    //       }]
    //     })
    //   }
    // );
    // Parse and return the structured response from Gemini

  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

/**
 * Generate audio narration using ElevenLabs TTS API
 * 
 * Recommended voice settings:
 * - Voice: Documentary narrator style (e.g., "Adam" or "Bella")
 * - Stability: 0.5-0.7
 * - Similarity: 0.75
 * - Style: Documentary/informative
 */
export async function generateNarration(text: string): Promise<string> {
  try {
    // OPTION 1: Call your DigitalOcean backend
    const response = await fetch(`${API_BASE_URL}/api/narrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      throw new Error('Narration generation failed');
    }

    const data = await response.json();
    return data.audioUrl;

    // OPTION 2: Direct ElevenLabs API call
    // const voiceId = 'pNInz6obpgDQGcFmaJgB'; // Adam voice
    // const response = await fetch(
    //   `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    //   {
    //     method: 'POST',
    //     headers: {
    //       'Accept': 'audio/mpeg',
    //       'Content-Type': 'application/json',
    //       'xi-api-key': ELEVENLABS_API_KEY
    //     },
    //     body: JSON.stringify({
    //       text: text,
    //       model_id: 'eleven_monolingual_v1',
    //       voice_settings: {
    //         stability: 0.6,
    //         similarity_boost: 0.75
    //       }
    //     })
    //   }
    // );
    // 
    // const audioBlob = await response.blob();
    // return URL.createObjectURL(audioBlob);

  } catch (error) {
    console.error('ElevenLabs API error:', error);
    throw error;
  }
}

/**
 * Combined analysis function that calls both APIs
 */
export async function analyzeObject(imageData: string): Promise<{
  analysis: GeminiAnalysisResponse;
  audioUrl: string;
}> {
  // First, analyze the image
  const analysis = await analyzeWithGemini(imageData);
  
  // Then, generate narration
  const audioUrl = await generateNarration(analysis.explanation);
  
  return { analysis, audioUrl };
}

// DigitalOcean Backend Example (Node.js/Express)
// 
// const express = require('express');
// const { GoogleGenerativeAI } = require('@google/generative-ai');
// const axios = require('axios');
// 
// const app = express();
// app.use(express.json({ limit: '50mb' }));
// 
// // Gemini endpoint
// app.post('/api/analyze', async (req, res) => {
//   const { image } = req.body;
//   const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
//   const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
//   
//   const result = await model.generateContent([
//     'Analyze environmental impact...',
//     { inlineData: { data: image.split(',')[1], mimeType: 'image/jpeg' } }
//   ]);
//   
//   res.json(parseGeminiResponse(result));
// });
// 
// // ElevenLabs endpoint
// app.post('/api/narrate', async (req, res) => {
//   const { text } = req.body;
//   const response = await axios.post(
//     'https://api.elevenlabs.io/v1/text-to-speech/...',
//     { text },
//     { headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY } }
//   );
//   
//   res.json({ audioUrl: uploadToStorage(response.data) });
// });
