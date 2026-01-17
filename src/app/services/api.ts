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
  "explanation": "A detailed 2-3 sentence explanation that MUST include the exact carbon footprint number (matching carbonValue) and explain what it means in relatable terms.",
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

CRITICAL REQUIREMENTS FOR ACCURACY AND CONSISTENCY:

1. carbonValue MUST be in GRAMS (not kg, not tons) representing FULL LIFECYCLE:
   - Include: raw material extraction, manufacturing, transportation, usage emissions (if applicable), and disposal
   - Typical realistic ranges based on research:
     * Small single-use items (bottle, can, cup): 30-150 grams
     * Clothing items (t-shirt, jeans): 3,000-15,000 grams (3-15kg)
     * Electronics (phone, tablet): 50,000-120,000 grams (50-120kg)  
     * Large electronics (laptop, TV): 150,000-300,000 grams (150-300kg)

2. carbonFootprint string MUST match carbonValue EXACTLY:
   - If carbonValue = 82.8, then carbonFootprint = "82.8g CO₂e"
   - If carbonValue = 95000, then carbonFootprint = "95kg CO₂e" or "95.0kg CO₂e"
   - Format: use "g" for values < 1000, "kg" for values >= 1000

3. explanation MUST be consistent with carbonValue and include the exact number:
   - Example for 82.8g: "This plastic bottle has a carbon footprint of 82.8 grams of CO₂ equivalent when accounting for its full lifecycle from petroleum extraction to landfill decomposition."
   - Example for 95000g: "This smartphone has a carbon footprint of 95 kilograms (95,000 grams) of CO₂ equivalent over its full lifecycle, including mining of rare earth elements, manufacturing in energy-intensive facilities, shipping, and end-of-life disposal."
   - DO NOT say "4.0 tons" if carbonValue is 4000 grams - that's only 4kg, not 4 tons!
   - DO NOT say vague things like "significant impact" without the actual number - ALWAYS include the exact carbonValue

4. Use realistic, research-based estimates:
   - Plastic water bottle: ~80-85g (mostly production)
   - Aluminum can: ~60-80g (high production energy, good recycling)
   - Disposable coffee cup: ~100-120g (paper + plastic lining)
   - Cotton t-shirt: ~5,000-8,000g (agriculture, processing, shipping)
   - Smartphone: ~70,000-95,000g (mining, manufacturing, some usage)
   - Laptop: ~180,000-220,000g (complex manufacturing, longer usage)

ACCURACY CHECK: Before returning, verify that:
- The number in explanation matches carbonValue exactly
- carbonFootprint string matches carbonValue exactly  
- All three (carbonValue, carbonFootprint, explanation number) are consistent`;

/**
 * Validate and normalize AI response to ensure consistency
 */
function validateAndNormalizeResponse(result: AnalysisResponse): void {
  // Extract number from carbonFootprint string if it exists
  const footprintMatch = result.carbonFootprint.match(/([\d.]+)/);
  if (footprintMatch) {
    const footprintNum = parseFloat(footprintMatch[1]);
    const isKg = result.carbonFootprint.toLowerCase().includes('kg');
    const normalizedValue = isKg ? footprintNum * 1000 : footprintNum;
    
    // If there's a significant mismatch (>10%), log warning but keep carbonValue as source of truth
    const difference = Math.abs(result.carbonValue - normalizedValue) / Math.max(result.carbonValue, normalizedValue);
    if (difference > 0.1) {
      console.warn(`Carbon footprint mismatch: carbonValue=${result.carbonValue}g, carbonFootprint="${result.carbonFootprint}". Updating carbonFootprint to match carbonValue.`);
    }
  }
  
  // Normalize carbonFootprint string to match carbonValue exactly
  if (result.carbonValue < 1000) {
    result.carbonFootprint = `${result.carbonValue.toFixed(result.carbonValue < 100 ? 2 : 1)}g CO₂e`;
  } else {
    result.carbonFootprint = `${(result.carbonValue / 1000).toFixed(1)}kg CO₂e`;
  }
  
  // Ensure explanation mentions the actual number (basic check)
  if (!result.explanation.toLowerCase().includes(result.carbonValue < 1000 
    ? result.carbonValue.toFixed(0) 
    : (result.carbonValue / 1000).toFixed(1))) {
    // Try to find and replace any inconsistent numbers in explanation
    const explanationMatch = result.explanation.match(/(\d+(?:\.\d+)?)\s*(?:tons?|tonnes?|kg|kilograms?)/i);
    if (explanationMatch) {
      const wrongValue = parseFloat(explanationMatch[1]);
      const isKg = /kg|kilogram/i.test(explanationMatch[0]);
      const wrongGrams = isKg ? wrongValue * 1000 : wrongValue;
      
      if (Math.abs(wrongGrams - result.carbonValue) / Math.max(wrongGrams, result.carbonValue) > 0.1) {
        console.warn(`Explanation contains inconsistent carbon value. Expected ${result.carbonValue}g but found ${wrongValue}${isKg ? 'kg' : 'g'}`);
      }
    }
  }
}

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
        max_tokens: 1500
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
    
    // Validate and normalize consistency
    validateAndNormalizeResponse(analysisResult);
    
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
