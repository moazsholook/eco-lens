import { useState, useEffect } from 'react';
import { Camera } from '@/app/components/Camera';
import { AnalysisResults } from '@/app/components/AnalysisResults';
import { Header } from '@/app/components/Header';
import { WelcomeScreen } from '@/app/components/WelcomeScreen';
import { Target, Flame, Sprout } from 'lucide-react';
import { 
  ProfileDashboard, 
  type UsagePeriod, 
  type UsageMetrics, 
  type UsageTrendPoint,
  type UsageInsight,
  type Badge,
  type RecentScan,
  type CategoryBreakdown
} from '@/app/components/ProfileDashboard';
import { SignIn, SignUp } from '@/app/components/auth';
import { getSpecificMockData } from '@/app/data/mockEnvironmentalData';
import { 
  analyzeWithGemini, 
  generateNarration, 
  lookupProductByBarcode, 
  saveEmission,
  loginUser,
  registerUser,
  getCurrentUser,
  logoutUser,
  getDashboardStats,
  getRecentScans,
  getCategoryBreakdown,
  type AuthUser,
  type DashboardStats,
  type RecentScan as ApiRecentScan,
  type CategoryBreakdown as ApiCategoryBreakdown
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
  // Auth state
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authView, setAuthView] = useState<'signin' | 'signup'>('signin');
  const [authLoading, setAuthLoading] = useState(false);

  // App state
  const [showCamera, setShowCamera] = useState(false);
  const [analysisData, setAnalysisData] = useState<EnvironmentalData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [barcodeMode, setBarcodeMode] = useState(false);

  // Profile dashboard state
  const [selectedPeriod, setSelectedPeriod] = useState<UsagePeriod>('weekly');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentScans, setRecentScans] = useState<ApiRecentScan[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<ApiCategoryBreakdown[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);

  // Fetch dashboard data when user logs in, period changes, or after new scan
  useEffect(() => {
    if (user) {
      const fetchDashboardData = async () => {
        setDashboardLoading(true);
        try {
          const [stats, scans, breakdown] = await Promise.all([
            getDashboardStats(user.id, selectedPeriod),
            getRecentScans(user.id, 5),
            getCategoryBreakdown(user.id, selectedPeriod === 'yearly' ? 365 : selectedPeriod === 'monthly' ? 30 : 7)
          ]);
          setDashboardStats(stats);
          setRecentScans(scans);
          setCategoryBreakdown(breakdown);
        } catch (error) {
          console.warn('Could not fetch dashboard data:', error);
        } finally {
          setDashboardLoading(false);
        }
      };
      fetchDashboardData();
    }
  }, [user, selectedPeriod, dashboardRefreshKey]);

  // Profile dashboard data - use real data if available, fallback to defaults
  const profilePeriods: Record<UsagePeriod, UsageMetrics> = {
    weekly: dashboardStats && selectedPeriod === 'weekly' ? dashboardStats.metrics : {
      label: 'Weekly',
      totalScans: 0,
      footprintKg: 0,
      improvementPercent: 0,
      topCategory: 'None',
      topItem: 'None',
      comparisonText: "Start scanning to track your progress!",
    },
    monthly: dashboardStats && selectedPeriod === 'monthly' ? dashboardStats.metrics : {
      label: 'Monthly',
      totalScans: 0,
      footprintKg: 0,
      improvementPercent: 0,
      topCategory: 'None',
      topItem: 'None',
      comparisonText: "Start scanning to track your progress!",
    },
    yearly: dashboardStats && selectedPeriod === 'yearly' ? dashboardStats.metrics : {
      label: 'Yearly',
      totalScans: 0,
      footprintKg: 0,
      improvementPercent: 0,
      topCategory: 'None',
      topItem: 'None',
      comparisonText: "Start scanning to track your progress!",
    },
  };

  const profileTrendSeries: Record<UsagePeriod, UsageTrendPoint[]> = {
    weekly: dashboardStats && selectedPeriod === 'weekly' ? dashboardStats.trendData : [],
    monthly: dashboardStats && selectedPeriod === 'monthly' ? dashboardStats.trendData : [],
    yearly: dashboardStats && selectedPeriod === 'yearly' ? dashboardStats.trendData : [],
  };

  const profileInsights: UsageInsight[] = dashboardStats ? [
    { 
      title: 'Top Category', 
      detail: `${dashboardStats.metrics.topCategory} is your biggest impact area.`, 
      trend: 'flat' as const
    },
    { 
      title: 'Progress', 
      detail: dashboardStats.metrics.improvementPercent > 0 
        ? `You've improved ${dashboardStats.metrics.improvementPercent}% this period!` 
        : 'Keep scanning to track your improvement.', 
      trend: dashboardStats.metrics.improvementPercent > 0 ? 'down' as const : 'flat' as const 
    },
    { 
      title: 'Most Scanned', 
      detail: `${dashboardStats.metrics.topItem} appears most in your scans.`, 
      trend: 'flat' as const 
    },
  ] : [
    { title: 'Get Started', detail: 'Scan your first item to see insights!', trend: 'flat' },
  ];

  const profileBadges: Badge[] = [
    { id: '1', name: 'First Scan', description: 'Complete your first scan', icon: <Target className="w-8 h-8" />, earned: (dashboardStats?.metrics.totalScans || 0) > 0 },
    { id: '2', name: 'Week Warrior', description: 'Scan for 7 days straight', icon: <Flame className="w-8 h-8" />, earned: false, progress: user?.stats?.streakDays || 0, total: 7 },
    { id: '3', name: 'Eco Explorer', description: 'Scan 10 different items', icon: <Sprout className="w-8 h-8" />, earned: (dashboardStats?.metrics.totalScans || 0) >= 10, progress: dashboardStats?.metrics.totalScans || 0, total: 10 },
  ];

  const profileCategoryBreakdown: CategoryBreakdown[] = categoryBreakdown.length > 0 
    ? categoryBreakdown 
    : [];

  const profileRecentScans: RecentScan[] = recentScans;

  const profileTips = [
    'Try reusable containers for takeout',
    'Choose locally sourced products',
    'Extend product life with proper care',
  ];

  // Calculate dynamic Eco Score (0-100)
  // Higher score = more eco-friendly behavior
  const calculateEcoScore = (): number => {
    let score = 50; // Start at baseline
    
    const budgetKg = (user?.dailyCO2Goal || 8000) / 1000; // Daily budget in kg
    const usedKg = dashboardStats?.metrics.footprintKg || 0;
    const totalScans = dashboardStats?.metrics.totalScans || 0;
    const streakDays = user?.stats?.streakDays || 0;
    const improvementPercent = dashboardStats?.metrics.improvementPercent || 0;
    
    // Factor 1: Carbon efficiency (up to 40 points)
    // Under budget = gain points, over budget = lose points
    if (budgetKg > 0) {
      const usageRatio = usedKg / budgetKg;
      if (usageRatio <= 1) {
        // Under budget: 0-40 bonus points (less usage = more points)
        score += Math.round((1 - usageRatio) * 40);
      } else {
        // Over budget: lose points (up to -40)
        score -= Math.min(40, Math.round((usageRatio - 1) * 40));
      }
    }
    
    // Factor 2: Engagement bonus (up to 20 points)
    // More scans = more awareness = better score
    score += Math.min(20, totalScans * 2);
    
    // Factor 3: Streak bonus (up to 15 points)
    // Consistent tracking = better habits
    score += Math.min(15, streakDays * 2);
    
    // Factor 4: Improvement bonus (up to 15 points)
    // Getting better over time
    score += Math.min(15, Math.round(improvementPercent / 5));
    
    // Clamp between 0 and 100
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const ecoScore = calculateEcoScore();

  // Check for existing session on app load
  useEffect(() => {
    getCurrentUser().then(existingUser => {
      if (existingUser) {
        setUser(existingUser);
        console.log('📱 Restored session for:', existingUser.name);
      }
    }).catch(() => {
      // No valid session, that's fine
    });
  }, []);

  // Auth handlers
  const handleSignIn = async (email: string, password: string) => {
    setAuthLoading(true);
    try {
      const response = await loginUser(email, password);
      setUser(response.user);
      setShowAuth(false);
      toast.success(`Welcome back, ${response.user.name}!`);
    } catch (error: any) {
      throw new Error(error.message || 'Sign in failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async (name: string, email: string, password: string) => {
    setAuthLoading(true);
    try {
      const response = await registerUser(name, email, password);
      setUser(response.user);
      setShowAuth(false);
      toast.success(`Welcome to EcoLens, ${response.user.name}!`);
    } catch (error: any) {
      throw new Error(error.message || 'Sign up failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = () => {
    logoutUser();
    setUser(null);
    setAnalysisData(null);
    toast.info('Signed out');
  };

  const handleShowSignIn = () => {
    setAuthView('signin');
    setShowAuth(true);
  };

  const handleShowSignUp = () => {
    setAuthView('signup');
    setShowAuth(true);
  };

  // Show auth pages when user chooses to sign in/up
  if (showAuth) {
    return (
      <>
        <Toaster position="top-center" richColors />
        {authView === 'signin' ? (
          <SignIn
            onSignIn={handleSignIn}
            onSwitchToSignUp={() => setAuthView('signup')}
            onBack={() => setShowAuth(false)}
            isLoading={authLoading}
          />
        ) : (
          <SignUp
            onSignUp={handleSignUp}
            onSwitchToSignIn={() => setAuthView('signin')}
            onBack={() => setShowAuth(false)}
            isLoading={authLoading}
          />
        )}
      </>
    );
  }

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

      // Save to database if user is logged in
      if (user) {
        try {
          await saveEmission({
            userId: user.id,
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
          // Trigger dashboard refresh when user returns
          setDashboardRefreshKey(k => k + 1);
        } catch (saveError) {
          console.warn('Could not save to database:', saveError);
        }
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
      <Header 
        onReset={handleReset} 
        showReset={!!analysisData} 
        user={user}
        onSignIn={handleShowSignIn}
        onSignOut={handleSignOut}
        hideUserControls={!!analysisData}
      />
      
      {!showCamera && !analysisData && !isAnalyzing && (
        user ? (
          <ProfileDashboard
            displayName={user.name}
            humanFillPercent={ecoScore}
            selectedPeriod={selectedPeriod}
            periods={profilePeriods}
            trendSeries={profileTrendSeries}
            insights={profileInsights}
            badges={profileBadges}
            recentScans={profileRecentScans}
            categoryBreakdown={profileCategoryBreakdown}
            streakDays={user.stats?.streakDays || 0}
            tips={profileTips}
            onPeriodChange={setSelectedPeriod}
            onStartScanning={handleStartScanning}
          />
        ) : (
          <WelcomeScreen onStart={handleStartScanning} />
        )
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