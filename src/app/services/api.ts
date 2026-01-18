// API Integration Layer for EcoLens
// Using Google Gemini 2.5 Flash for image analysis and ElevenLabs for TTS

// @ts-expect-error Vite env types
const GEMINI_API_KEY: string = import.meta.env.VITE_GEMINI_API_KEY || '';
// @ts-expect-error Vite env types
const ELEVENLABS_API_KEY: string = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
// @ts-expect-error Vite env types
const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// ============================================
// AUTH TYPES & FUNCTIONS
// ============================================

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  dailyCO2Goal?: number;
  stats?: {
    totalScans: number;
    totalCO2: number;
    streakDays: number;
  };
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

// Store token in localStorage
const TOKEN_KEY = 'ecolens_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Register a new user
 */
export async function registerUser(name: string, email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Registration failed');
  }

  // Store token
  setStoredToken(data.token);
  
  return data;
}

/**
 * Login user
 */
export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }

  // Store token
  setStoredToken(data.token);
  
  return data;
}

/**
 * Get current user from stored token
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      clearStoredToken();
      return null;
    }

    return response.json();
  } catch (error) {
    clearStoredToken();
    return null;
  }
}

/**
 * Logout user
 */
export function logoutUser(): void {
  clearStoredToken();
}

// ============================================
// PRODUCT TYPES
// ============================================

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

const ANALYSIS_PROMPT = `You are an environmental impact analyzer. Analyze the object in the image and provide detailed environmental data based on FULL LIFECYCLE ASSESSMENT.

CRITICAL: MANUFACTURING COSTS ARE MANDATORY FOR ALL PRODUCTS. Manufacturing typically accounts for 50-90% of a product's total carbon footprint, especially for:
- Plastics and synthetic materials (petroleum extraction, refining, polymerization, molding)
- Metals (mining, smelting, processing - especially aluminum which requires massive energy)
- Electronics and tech devices (rare earth mining, semiconductor fabrication, assembly)
- Synthetic textiles (petroleum-based fibers, chemical processing, dyeing)
- Disposable/single-use items (intensive production processes for short lifespan)

NEVER report 0g or near-0g carbon footprint. Even small items like plastic bottles or cans have significant manufacturing costs (80-85g for bottles, 60-80g for cans). Smart watches have 20-40kg CO2e despite their small size because electronics manufacturing is extremely energy-intensive.

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

1. carbonValue MUST be in GRAMS (not kg, not tons) representing FULL LIFECYCLE - MANUFACTURING IS MANDATORY:
   
   **MANDATORY COMPONENTS FOR ALL PRODUCTS:**
   - Raw material extraction (mining, drilling, agriculture, forestry)
   - MANUFACTURING PROCESSES (this is usually 50-90% of total impact):
     * Material processing (refining petroleum, smelting metals, chemical synthesis)
     * Product formation (molding plastics, forging metals, assembly)
     * Energy-intensive processes (especially for plastics, metals, electronics)
   - Transportation (to market and end-of-life)
   - Usage emissions (only if product consumes energy/fuel during use)
   - Disposal/decomposition (landfill, recycling, incineration)
   
   **Manufacturing costs by material type:**
   - Plastics: Petroleum extraction (~20g per gram of plastic) + refining + polymerization + molding (~40-60g total per bottle/can)
   - Aluminum: Bauxite mining + Bayer process + Hall-Héroult smelting (extremely energy-intensive: ~8-10kg CO2 per kg aluminum)
   - Synthetic materials: Petroleum extraction + chemical processing + fiber production
   - Electronics: Rare earth mining + semiconductor fabrication + assembly (most energy-intensive)
   
   **Typical realistic ranges based on research (INCLUDING full manufacturing):**
     * Plastic water bottle: 80-85g (petroleum extraction + refining + bottle formation + transport)
     * Aluminum can: 60-80g (bauxite mining + energy-intensive smelting + can formation)
     * Disposable coffee cup: 100-120g (paper production + plastic lining + manufacturing)
     * Smart watch: 20,000-40,000g (electronics manufacturing is energy-intensive!)
     * Smartphone: 70,000-95,000g (rare earth mining + complex manufacturing)
     * Cotton t-shirt: 5,000-8,000g (cotton agriculture + processing + manufacturing + shipping)
     * Synthetic t-shirt: 8,000-12,000g (petroleum extraction + polymer production + manufacturing)
     * Laptop: 180,000-220,000g (complex electronics manufacturing)
     * Large electronics (TV): 200,000-300,000g

2. carbonFootprint string MUST match carbonValue EXACTLY:
   - If carbonValue = 82.8, then carbonFootprint = "82.8g CO₂e"
   - If carbonValue = 95000, then carbonFootprint = "95kg CO₂e" or "95.0kg CO₂e"
   - Format: use "g" for values < 1000, "kg" for values >= 1000

3. explanation MUST be consistent with carbonValue, include the exact number, and emphasize manufacturing:
   - Example for 82.8g: "This plastic water bottle has a carbon footprint of 82.8 grams of CO₂ equivalent. The majority comes from manufacturing: petroleum extraction, refining into plastic resin, and bottle molding processes account for most of its environmental cost."
   - Example for 60g (can): "This aluminum can has a carbon footprint of 60 grams of CO₂ equivalent. Despite its small size, aluminum production is extremely energy-intensive - the smelting process alone accounts for over 80% of the can's total carbon footprint."
   - Example for 95000g: "This smartphone has a carbon footprint of 95 kilograms (95,000 grams) of CO₂ equivalent. Manufacturing dominates this impact: rare earth mining, semiconductor chip fabrication, and assembly in energy-intensive facilities account for 70-80% of the total."
   - Example for 30000g (smart watch): "This smartwatch has a carbon footprint of 30 kilograms (30,000 grams) of CO₂ equivalent. Despite its compact size, the manufacturing process - including rare earth mining for components and semiconductor fabrication - makes it a high-impact item."
   - DO NOT say "4.0 tons" if carbonValue is 4000 grams - that's only 4kg, not 4 tons!
   - DO NOT say vague things like "significant impact" without the actual number - ALWAYS include the exact carbonValue
   - ALWAYS mention manufacturing costs in the explanation, especially for plastics, metals, and electronics

4. Use realistic, research-based estimates with FULL manufacturing included:
   
   **Single-use items (manufacturing is majority of impact):**
   - Plastic water bottle: ~80-85g (petroleum extraction 20g + refining 15g + bottle molding 40g + transport 10g)
   - Aluminum can: ~60-80g (bauxite mining 5g + smelting 50g + can formation 10g + transport 5g)
   - Disposable coffee cup: ~100-120g (paper production 30g + plastic lining 40g + manufacturing 30g + transport 20g)
   - Plastic bag: ~5-10g (but often used once, so impact per use is significant)
   
   **Electronics (manufacturing dominates - 70-90% of total):**
   - Smart watch: ~20,000-40,000g (rare earth mining 5k + semiconductor fab 15k + assembly 5k + shipping 3k)
   - Smartphone: ~70,000-95,000g (rare earth mining 20k + chip fab 35k + screen/battery 20k + assembly 10k)
   - Tablet: ~50,000-70,000g (similar to phone, slightly less complex)
   - Laptop: ~180,000-220,000g (larger screen 40k + complex board 80k + battery 30k + assembly 40k)
   - TV: ~200,000-300,000g (large screen manufacturing is extremely energy-intensive)
   
   **Clothing (manufacturing varies by material):**
   - Cotton t-shirt: ~5,000-8,000g (cotton farming 2k + processing 1.5k + manufacturing 2k + shipping 1.5k)
   - Synthetic t-shirt (polyester): ~8,000-12,000g (petroleum extraction 3k + polymerization 2k + fiber production 2k + manufacturing 2k)
   - Jeans: ~15,000-25,000g (cotton farming 6k + processing 4k + dyeing 3k + manufacturing 4k)
   
   **KEY POINT: Even small items have manufacturing costs. A plastic bottle is NOT 0g - it's 80-85g due to manufacturing!**

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
 * Analyze image using Google Gemini 2.5 Flash API
 */
export async function analyzeWithGemini(imageData: string): Promise<AnalysisResponse> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  try {
    // Extract base64 data and mime type from data URL
    const matches = imageData.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      throw new Error('Invalid image data format');
    }
    const mimeType = matches[1];
    const base64Data = matches[2];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: ANALYSIS_PROMPT },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Data
                  }
                }
              ]
            }
          ],
          generationConfig: {
            maxOutputTokens: 4096
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error response:', errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();

    // Extract text from Gemini response
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textContent) {
      throw new Error('No response from Gemini');
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
    console.error('Gemini API error:', error);
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

// ============================================
// DATABASE API FUNCTIONS
// ============================================

export interface SaveEmissionRequest {
  userId: string;
  imageUrl?: string;
  objectName: string;
  category?: string;
  carbonValue: number;
  carbonFootprint: string;
  lifecycle?: string[];
  explanation?: string;
  alternatives?: { name: string; benefit: string; carbonSavings: string }[];
  quantity?: number;
}

export interface EmissionResponse {
  _id: string;
  userId: string;
  objectName: string;
  carbonValue: number;
  carbonFootprint: string;
  category: string;
  scannedAt: string;
  date: string;
}

export interface DailyEmissionsResponse {
  date: string;
  emissions: EmissionResponse[];
  totalCO2: number;
  count: number;
}

export interface UserResponse {
  _id: string;
  email: string;
  name: string;
  dailyCO2Goal: number;
  stats: {
    totalScans: number;
    totalCO2: number;
    streakDays: number;
  };
}

/**
 * Save emission to database after analysis
 */
export async function saveEmission(data: SaveEmissionRequest): Promise<EmissionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/emissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save emission');
  }
  
  return response.json();
}

/**
 * Get today's emissions for a user
 */
export async function getTodayEmissions(userId: string): Promise<DailyEmissionsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/emissions/today/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to get today emissions');
  }
  return response.json();
}

/**
 * Get emission history for a user
 */
export async function getEmissionHistory(userId: string, days: number = 7): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/api/emissions/history/${userId}?days=${days}`);
  if (!response.ok) {
    throw new Error('Failed to get emission history');
  }
  return response.json();
}

// ============================================
// DASHBOARD API
// ============================================

export interface RecentScan {
  id: string;
  itemName: string;
  category: string;
  impactKg: number;
  scannedAt: string;
  imageUrl?: string;
}

export interface CategoryBreakdown {
  category: string;
  percentage: number;
  impactKg: number;
  color: string;
}

export interface DashboardMetrics {
  label: string;
  totalScans: number;
  footprintKg: number;
  improvementPercent: number;
  topCategory: string;
  topItem: string;
  comparisonText: string;
}

export interface TrendDataPoint {
  label: string;
  value: number;
}

export interface DashboardStats {
  metrics: DashboardMetrics;
  trendData: TrendDataPoint[];
}

/**
 * Get recent scans for user
 */
export async function getRecentScans(userId: string, limit: number = 10): Promise<RecentScan[]> {
  const response = await fetch(`${API_BASE_URL}/api/emissions/recent/${userId}?limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to get recent scans');
  }
  return response.json();
}

/**
 * Get category breakdown for user
 */
export async function getCategoryBreakdown(userId: string, days: number = 30): Promise<CategoryBreakdown[]> {
  const response = await fetch(`${API_BASE_URL}/api/emissions/breakdown/${userId}?days=${days}`);
  if (!response.ok) {
    throw new Error('Failed to get category breakdown');
  }
  return response.json();
}

/**
 * Get dashboard stats by period
 */
export async function getDashboardStats(userId: string, period: 'weekly' | 'monthly' | 'yearly' = 'weekly'): Promise<DashboardStats> {
  const response = await fetch(`${API_BASE_URL}/api/dashboard/stats/${userId}?period=${period}`);
  if (!response.ok) {
    throw new Error('Failed to get dashboard stats');
  }
  return response.json();
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
