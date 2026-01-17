// API Integration Layer for EcoLens
// Using OpenAI GPT-4 Vision API for image analysis and ElevenLabs for TTS

// @ts-expect-error Vite env types
const OPENAI_API_KEY: string = import.meta.env.VITE_OPENAI_API_KEY || '';
// @ts-expect-error Vite env types
const ELEVENLABS_API_KEY: string = import.meta.env.VITE_ELEVENLABS_API_KEY || '';

/**
 * Product data from Open Product Data API
 */
export interface ProductData {
  title?: string;
  description?: string;
  brand?: string;
  category?: string;
  images?: string[];
  barcode?: string;
  error?: string;
}

export interface AnalysisResponse {
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

const ANALYSIS_PROMPT = `You are an environmental impact analyzer. Analyze the object in this image and provide detailed environmental data.

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "objectName": "Name of the object",
  "carbonFootprint": "X.Xg CO₂e" or "X.Xkg CO₂e",
  "carbonValue": 82.8,
  "lifecycle": [
    "Stage 1: Description",
    "Stage 2: Description",
    "Stage 3: Description",
    "Stage 4: Description"
  ],
  "explanation": "A detailed 2-3 sentence explanation of this object's environmental impact, including production, usage, and disposal considerations.",
  "alternatives": [
    {
      "name": "Alternative 1",
      "benefit": "Why it's better",
      "carbonSavings": "Saves X% carbon"
    },
    {
      "name": "Alternative 2",
      "benefit": "Why it's better",
      "carbonSavings": "Saves X% carbon"
    },
    {
      "name": "Alternative 3",
      "benefit": "Why it's better",
      "carbonSavings": "Saves X% carbon"
    }
  ]
}

IMPORTANT:
- Be specific with real carbon footprint estimates based on lifecycle analysis research
- carbonValue must be a positive number in GRAMS (not kg). For example: a plastic bottle = 82.8, a laptop = 200000
- carbonFootprint string should match the carbonValue (use "g" for values < 1000, "kg" for values >= 1000)
- Use 2 decimal places for values < 100, 1 decimal place for values < 1000, and whole numbers for larger values`;

/**
 * Analyze image using OpenAI GPT-4 Vision API
 */
export async function analyzeWithGemini(imageData: string): Promise<AnalysisResponse> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: ANALYSIS_PROMPT },
              {
                type: 'image_url',
                image_url: {
                  url: imageData,
                  detail: 'low'
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error response:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();

    // Extract text from OpenAI response
    const textContent = data.choices?.[0]?.message?.content;
    if (!textContent) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response (handle potential markdown code blocks)
    let jsonStr = textContent.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7);
    }
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3);
    }

    const analysisResult = JSON.parse(jsonStr.trim());
    return analysisResult;

  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}

/**
 * Generate audio narration using ElevenLabs TTS API
 */
export async function generateNarration(text: string): Promise<string> {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured');
  }

  try {
    // Using "Rachel" voice - available on free tier
    const voiceId = '21m00Tcm4TlvDq8ikWAM';

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.75
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', errorText);
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    // Convert audio blob to URL
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    return audioUrl;

  } catch (error) {
    console.error('ElevenLabs API error:', error);
    throw error;
  }
}

/**
 * Lookup product information by barcode using Open Product Data API
 * @param barcode - The barcode (UPC/EAN) to lookup
 * @returns Product data including name, brand, images, etc.
 */
export async function lookupProductByBarcode(barcode: string): Promise<ProductData> {
  try {
    // Remove any non-digit characters from barcode
    const cleanBarcode = barcode.replace(/\D/g, '');
    
    if (!cleanBarcode || cleanBarcode.length < 8) {
      throw new Error('Invalid barcode format');
    }

    const response = await fetch(`https://www.product-lookup.com/api/${cleanBarcode}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      // If product not found, return empty data
      if (response.status === 404) {
        return {
          barcode: cleanBarcode,
          error: 'Product not found in database'
        };
      }
      throw new Error(`Product lookup API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Normalize the response format (API format may vary)
    return {
      title: data.title || data.name || data.product_name,
      description: data.description,
      brand: data.brand || data.manufacturer,
      category: data.category || data.category_name,
      images: data.images || (data.image ? [data.image] : []),
      barcode: cleanBarcode
    };

  } catch (error) {
    console.error('Barcode lookup error:', error);
    throw error;
  }
}
