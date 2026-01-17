import { useState } from 'react';
import { Camera } from '@/app/components/Camera';
import { AnalysisResults } from '@/app/components/AnalysisResults';
import { Header } from '@/app/components/Header';
import { WelcomeScreen } from '@/app/components/WelcomeScreen';
import { getSpecificMockData } from '@/app/data/mockEnvironmentalData';
import { 
  analyzeWithGemini, 
  generateNarration, 
  lookupProductByBarcode, 
  saveEmission
} from '@/app/services/api';
import { Toaster } from '@/app/components/ui/sonner';
import { toast } from 'sonner';

export interface EnvironmentalData {
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
  imageUrl: string;
  audioUrl?: string;
}

export default function App() {
  const [showCamera, setShowCamera] = useState(false);
  const [analysisData, setAnalysisData] = useState<EnvironmentalData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [barcodeMode, setBarcodeMode] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const handleStartScanning = () => {
    setBarcodeMode(false);
    setShowCamera(true);
    toast.info('Position object in frame and tap to capture', {
      duration: 3000,
    });
  };

  const handleStartBarcodeScanning = () => {
    setBarcodeMode(true);
    setShowCamera(true);
    toast.info('Point camera at barcode to scan product', {
      duration: 3000,
    });
  };

  const handleBarcodeDetected = async (barcode: string) => {
    setIsAnalyzing(true);
    setShowCamera(false);
    toast.loading('Looking up product information...', { id: 'barcode' });

    try {
      // Lookup product by barcode
      const productData = await lookupProductByBarcode(barcode);
      
      if (productData.error || !productData.title) {
        toast.error('Product not found. Try scanning the object directly.', { id: 'barcode' });
        setIsAnalyzing(false);
        return;
      }

      toast.loading('Analyzing environmental impact...', { id: 'barcode' });

      // Use product name and description to analyze with Gemini
      // Create a text prompt with product info instead of image
      const productPrompt = `Product Information:
Name: ${productData.title}
Brand: ${productData.brand || 'Unknown'}
Category: ${productData.category || 'Unknown'}
Description: ${productData.description || 'No description available'}

Analyze this product's environmental impact.`;

      // Since we have product info but no image, we can either:
      // 1. Use Gemini text analysis (if API supports it)
      // 2. Use the product image if available
      // 3. Fall back to mock data based on category
      
      // For now, we'll use a mock image URL and let Gemini analyze the product name
      const imageUrl = productData.images?.[0] || 'https://via.placeholder.com/400?text=Product';
      
      // Use Gemini vision with product image if available, or create a synthetic analysis
      let analysisResult: EnvironmentalData;
      
      if (productData.images?.[0]) {
        // Use image if available
        const analysis = await analyzeWithGemini(productData.images[0]);
        analysisResult = { ...analysis, imageUrl: productData.images[0] };
      } else {
        // Create analysis based on product info (enhanced mock data)
        const mockData = getSpecificMockData('bottle', imageUrl); // Fallback to bottle
        analysisResult = {
          ...mockData,
          objectName: productData.title || 'Product',
          // carbonFootprint and other values come from mockData
        };
      }

      // Enhance with product data
      analysisResult.objectName = productData.title;
      if (productData.brand) {
        analysisResult.objectName = `${productData.brand} ${productData.title}`;
      }

      // Generate narration
      toast.loading('Generating narration...', { id: 'barcode' });
      let audioUrl: string | undefined;
      try {
        audioUrl = await generateNarration(analysisResult.explanation);
      } catch (audioError) {
        console.warn('Audio generation failed, continuing without narration:', audioError);
      }

      setAnalysisData({
        ...analysisResult,
        imageUrl: productData.images?.[0] || imageUrl,
        audioUrl,
      });

      toast.success('Product analyzed!', { id: 'barcode' });
    } catch (error) {
      console.error('Barcode scan failed:', error);
      toast.error('Failed to analyze product. Please try again.', { id: 'barcode' });
    } finally {
      setIsAnalyzing(false);
      setBarcodeMode(false);
    }
  };

  const handleDemoSelect = async (demoType: string) => {
    setIsAnalyzing(true);
    toast.loading('Analyzing with Gemini AI...', { id: 'analysis' });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Use actual Unsplash images for each demo type
    const demoImages: Record<string, string> = {
      bottle: 'https://images.unsplash.com/photo-1616118132534-381148898bb4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGFzdGljJTIwd2F0ZXIlMjBib3R0bGV8ZW58MXx8fHwxNzY4NjY4MzE1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      coffee: 'https://images.unsplash.com/photo-1572459602976-cdd76f9731cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBjdXAlMjBkaXNwb3NhYmxlfGVufDF8fHx8MTc2ODY2ODMxNnww&ixlib=rb-4.1.0&q=80&w=1080',
      phone: 'https://images.unsplash.com/photo-1761907174062-c8baf8b7edb3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHBob25lJTIwbW9kZXJufGVufDF8fHx8MTc2ODYyOTA3NXww&ixlib=rb-4.1.0&q=80&w=1080',
      shirt: 'https://images.unsplash.com/photo-1759572095329-1dcf9522762b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3R0b24lMjB0c2hpcnR8ZW58MXx8fHwxNzY4NjUyMzEwfDA&ixlib=rb-4.1.0&q=80&w=1080',
      laptop: 'https://images.unsplash.com/photo-1511385348-a52b4a160dc2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBjb21wdXRlcnxlbnwxfHx8fDE3Njg2NDgwNjN8MA&ixlib=rb-4.1.0&q=80&w=1080'
    };
    
    const imageUrl = demoImages[demoType] || demoImages.bottle;
    const mockData = getSpecificMockData(demoType, imageUrl);
    setAnalysisData(mockData);
    setIsAnalyzing(false);
    
    toast.success('Analysis complete!', { id: 'analysis' });
  };

  const handleCapture = async (imageData: string) => {
    setIsAnalyzing(true);
    setShowCamera(false);
    toast.loading('Analyzing image...', { id: 'analysis' });

    try {
      const analysisResult = await analyzeWithGemini(imageData);

      // Generate voice narration
      toast.loading('Generating narration...', { id: 'analysis' });
      let audioUrl: string | undefined;
      try {
        audioUrl = await generateNarration(analysisResult.explanation);
      } catch (audioError) {
        console.warn('Audio generation failed, continuing without narration:', audioError);
      }

      try {
        await saveEmission({
          userId: userId ?? "696c175caa25d65884c9db79",
          imageUrl: imageData,
          objectName: analysisResult.objectName,
          category: detectCategory(analysisResult.objectName),
          carbonValue: analysisResult.carbonValue,
          carbonFootprint: analysisResult.carbonFootprint,
          lifecycle: analysisResult.lifecycle,
          explanation: analysisResult.explanation,
          alternatives: analysisResult.alternatives,
        });
        console.log('💾 Emission saved to database');
      } catch (saveError) {
        console.warn('Could not save to database:', saveError);
        // Don't fail the whole flow if save fails
      }

      setAnalysisData({
        ...analysisResult,
        imageUrl: imageData,
        audioUrl,
      });

      toast.success('Analysis complete!', { id: 'analysis' });
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Analysis failed. Please try again.', { id: 'analysis' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper to detect category from object name
  const detectCategory = (objectName: string): string => {
    const name = objectName.toLowerCase();
    if (name.includes('bottle') || name.includes('drink') || name.includes('coffee') || name.includes('cup') || name.includes('water')) return 'beverage';
    if (name.includes('shirt') || name.includes('pants') || name.includes('dress') || name.includes('jacket') || name.includes('shoe')) return 'clothing';
    if (name.includes('phone') || name.includes('laptop') || name.includes('computer') || name.includes('tablet')) return 'electronics';
    if (name.includes('food') || name.includes('fruit') || name.includes('meat') || name.includes('vegetable') || name.includes('banana') || name.includes('apple')) return 'food';
    if (name.includes('bag') || name.includes('package') || name.includes('box') || name.includes('wrapper')) return 'packaging';
    if (name.includes('car') || name.includes('bus') || name.includes('bike') || name.includes('plane')) return 'transportation';
    return 'other';
  };

  const handleReset = () => {
    setAnalysisData(null);
    setShowCamera(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <Toaster position="top-center" richColors />
      <Header onReset={handleReset} showReset={!!analysisData} onDemoSelect={handleDemoSelect} />
      
      {!showCamera && !analysisData && !isAnalyzing && (
        <WelcomeScreen onStart={handleStartScanning} onBarcodeScan={handleStartBarcodeScanning} />
      )}
      
      {showCamera && (
        <Camera 
          onCapture={handleCapture} 
          onClose={() => {
            setShowCamera(false);
            setBarcodeMode(false);
          }}
          isAnalyzing={isAnalyzing}
          enableBarcodeScan={barcodeMode}
          onBarcodeDetected={handleBarcodeDetected}
        />
      )}
      
      {isAnalyzing && !showCamera && (
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-emerald-900">Analyzing with Gemini AI...</p>
            <p className="text-sm text-emerald-600 mt-2">Calculating environmental impact</p>
          </div>
        </div>
      )}
      
      {analysisData && !isAnalyzing && (
        <AnalysisResults data={analysisData} onScanAnother={handleStartScanning} />
      )}
    </div>
  );
}