# 🚀 Backend Integration Quick Start

This guide will help you connect EcoLens to Google Gemini, ElevenLabs, and DigitalOcean.

## Prerequisites

- DigitalOcean account
- Google Cloud account (for Gemini API)
- ElevenLabs account
- Node.js 18+ installed

---

## Step 1: Get API Keys

### Google Gemini API
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key (starts with `AIza...`)

### ElevenLabs API
1. Go to [ElevenLabs Profile](https://elevenlabs.io/app/profile)
2. Copy your API key from the profile page
3. Choose a voice ID:
   - Adam (documentary): `pNInz6obpgDQGcFmaJgB`
   - Bella (informative): `EXAVITQu4vr4xnSDxMaL`

---

## Step 2: Set Up DigitalOcean Backend

### Option A: Using App Platform (Recommended)

1. **Create new App:**
   ```bash
   # Initialize your backend
   mkdir ecolens-backend
   cd ecolens-backend
   npm init -y
   npm install express cors dotenv
   npm install @google/generative-ai axios
   ```

2. **Create Express server (`server.js`):**
   ```javascript
   const express = require('express');
   const cors = require('cors');
   const { GoogleGenerativeAI } = require('@google/generative-ai');
   const axios = require('axios');
   require('dotenv').config();

   const app = express();
   app.use(cors());
   app.use(express.json({ limit: '50mb' }));

   const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

   // Analyze endpoint
   app.post('/api/analyze', async (req, res) => {
     try {
       const { image } = req.body;
       const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
       
       const prompt = `Identify this object in the image. Analyze its environmental impact including:
       1. Carbon footprint in grams CO2e (be specific with numbers)
       2. Complete product lifecycle stages from raw material to disposal
       3. Detailed explanation of environmental impact (2-3 sentences)
       4. Three sustainable alternatives with carbon savings percentages
       
       Return ONLY valid JSON with these exact fields:
       {
         "objectName": "string",
         "carbonFootprint": "string (e.g., ~82.8g CO₂e)",
         "carbonValue": number,
         "lifecycle": ["stage1", "stage2", ...],
         "explanation": "string",
         "alternatives": [
           {
             "name": "string",
             "benefit": "string",
             "carbonSavings": "string"
           }
         ]
       }`;

       const result = await model.generateContent([
         prompt,
         {
           inlineData: {
             data: image.split(',')[1],
             mimeType: 'image/jpeg'
           }
         }
       ]);

       const response = await result.response;
       const text = response.text();
       
       // Parse JSON from response
       const jsonMatch = text.match(/\{[\s\S]*\}/);
       const data = JSON.parse(jsonMatch[0]);
       
       res.json(data);
     } catch (error) {
       console.error('Gemini API error:', error);
       res.status(500).json({ error: 'Analysis failed' });
     }
   });

   // Narrate endpoint
   app.post('/api/narrate', async (req, res) => {
     try {
       const { text } = req.body;
       const voiceId = 'pNInz6obpgDQGcFmaJgB'; // Adam voice
       
       const response = await axios({
         method: 'post',
         url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
         headers: {
           'Accept': 'audio/mpeg',
           'Content-Type': 'application/json',
           'xi-api-key': process.env.ELEVENLABS_API_KEY
         },
         data: {
           text: text,
           model_id: 'eleven_monolingual_v1',
           voice_settings: {
             stability: 0.6,
             similarity_boost: 0.75
           }
         },
         responseType: 'arraybuffer'
       });

       // For production, upload to DigitalOcean Spaces:
       // const audioUrl = await uploadToSpaces(response.data);
       // res.json({ audioUrl });

       // For now, return base64
       const base64Audio = Buffer.from(response.data).toString('base64');
       const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
       res.json({ audioUrl });
       
     } catch (error) {
       console.error('ElevenLabs API error:', error);
       res.status(500).json({ error: 'Narration failed' });
     }
   });

   const PORT = process.env.PORT || 3000;
   app.listen(PORT, () => {
     console.log(`EcoLens API running on port ${PORT}`);
   });
   ```

3. **Create `.env` file:**
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   PORT=3000
   ```

4. **Deploy to DigitalOcean:**
   ```bash
   # Push to GitHub
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main

   # In DigitalOcean App Platform:
   # 1. Create new app
   # 2. Connect GitHub repo
   # 3. Add environment variables
   # 4. Deploy
   ```

### Option B: Using DigitalOcean Droplet

1. Create a Droplet (Ubuntu 22.04)
2. SSH into droplet
3. Install Node.js and deploy as a service

---

## Step 3: Connect Frontend to Backend

1. **Update frontend `.env`:**
   ```env
   VITE_API_BASE_URL=https://your-app.ondigitalocean.app
   ```

2. **Update `/src/app/App.tsx`:**
   ```typescript
   // Replace this line:
   const mockData = getMockEnvironmentalData(imageData);
   
   // With actual API call:
   const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/analyze`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ image: imageData })
   });
   const analysisData = await response.json();
   
   // Get narration
   const audioResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/narrate`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ text: analysisData.explanation })
   });
   const { audioUrl } = await audioResponse.json();
   
   const mockData = { ...analysisData, imageUrl: imageData, audioUrl };
   ```

---

## Step 4: Test the Integration

1. **Start frontend:**
   ```bash
   npm run dev
   ```

2. **Test camera capture:**
   - Open app in browser
   - Click "Start Scanning"
   - Capture an image
   - Verify API calls in Network tab

3. **Check backend logs:**
   - DigitalOcean App Platform → Logs
   - Look for successful API calls to Gemini and ElevenLabs

---

## Step 5: Optional - Add DigitalOcean Spaces for Audio Storage

```javascript
// Install AWS SDK (compatible with DO Spaces)
npm install @aws-sdk/client-s3

// Add to server.js
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  endpoint: 'https://nyc3.digitaloceanspaces.com',
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.SPACES_KEY,
    secretAccessKey: process.env.SPACES_SECRET
  }
});

async function uploadToSpaces(audioBuffer) {
  const fileName = `audio-${Date.now()}.mp3`;
  
  await s3Client.send(new PutObjectCommand({
    Bucket: 'ecolens',
    Key: fileName,
    Body: audioBuffer,
    ACL: 'public-read',
    ContentType: 'audio/mpeg'
  }));
  
  return `https://ecolens.nyc3.digitaloceanspaces.com/${fileName}`;
}
```

---

## Troubleshooting

### Gemini API Issues
- **Rate limits:** Free tier = 60 requests/minute
- **Image size:** Keep under 4MB
- **JSON parsing:** Gemini might return markdown - extract JSON with regex

### ElevenLabs Issues
- **Character limits:** Free tier = 10,000 chars/month
- **Voice cloning:** Requires paid plan
- **Latency:** TTS takes 2-5 seconds

### CORS Issues
- Add CORS middleware: `app.use(cors({ origin: 'your-frontend-url' }))`

### Camera not working
- Requires HTTPS in production
- Test locally with `localhost` or `127.0.0.1`

---

## Cost Estimates (Monthly)

- **DigitalOcean App Platform:** $5-12 (Basic tier)
- **Google Gemini API:** Free tier (60 req/min), then $0.00025/image
- **ElevenLabs:** Free tier (10k chars), then $5/month (30k chars)
- **DigitalOcean Spaces:** $5/month (250GB)

**Total:** ~$10-20/month for demo, scales as needed

---

## Production Checklist

- [ ] Set up error logging (Sentry, LogRocket)
- [ ] Add rate limiting
- [ ] Implement caching for common objects
- [ ] Set up monitoring (UptimeRobot)
- [ ] Add authentication if needed
- [ ] Optimize image compression before sending
- [ ] Set up CI/CD pipeline
- [ ] Add analytics (PostHog, Mixpanel)

---

## Resources

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [ElevenLabs API Docs](https://elevenlabs.io/docs)
- [DigitalOcean App Platform](https://docs.digitalocean.com/products/app-platform/)
- [DigitalOcean Spaces](https://docs.digitalocean.com/products/spaces/)

---

**Need help?** Check the example code in `/src/app/services/api.ts`
