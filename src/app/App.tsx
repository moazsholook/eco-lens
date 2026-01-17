import { useState } from 'react';
import { Camera } from '@/app/components/Camera';
import { AnalysisResults } from '@/app/components/AnalysisResults';
import { Header } from '@/app/components/Header';
import { WelcomeScreen } from '@/app/components/WelcomeScreen';
import { getMockEnvironmentalData, getSpecificMockData } from '@/app/data/mockEnvironmentalData';
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

  const handleStartScanning = () => {
    setShowCamera(true);
    toast.info('Position object in frame and tap to capture', {
      duration: 3000,
    });
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
    
    // TODO: Replace with actual Gemini API call
    // Example Gemini API integration:
    // const response = await fetch('YOUR_DIGITALOCEAN_BACKEND/analyze', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ image: imageData })
    // });
    // const data = await response.json();
    
    // Mock delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get random mock data for demo purposes
    const mockData = getMockEnvironmentalData(imageData);
    
    // TODO: Get audio narration from ElevenLabs
    // const audioResponse = await fetch('YOUR_DIGITALOCEAN_BACKEND/narrate', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ text: mockData.explanation })
    // });
    // mockData.audioUrl = await audioResponse.text();
    
    setAnalysisData(mockData);
    setIsAnalyzing(false);
    setShowCamera(false);
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
        <WelcomeScreen onStart={handleStartScanning} />
      )}
      
      {showCamera && (
        <Camera 
          onCapture={handleCapture} 
          onClose={() => setShowCamera(false)}
          isAnalyzing={isAnalyzing}
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