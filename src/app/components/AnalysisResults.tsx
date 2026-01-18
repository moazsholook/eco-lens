import { useState, useRef, useEffect } from 'react';
import { Camera, Volume2, VolumeX, Leaf, TrendingDown, Lightbulb, Recycle, AlertCircle, Settings, Mic, Cloud } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Separator } from '@/app/components/ui/separator';
import { CarbonComparisons } from '@/app/components/CarbonComparisons';
import { getCarbonImpactMetrics, getIdealAnnualFootprint, generateBellCurveData } from '@/app/utils/carbonImpact';
import type { EnvironmentalData } from '@/app/App';

interface AnalysisResultsProps {
  data: EnvironmentalData;
  onScanAnother: () => void;
}

export function AnalysisResults({ data, onScanAnother }: AnalysisResultsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Auto-play narration if audio URL is available
    if (data.audioUrl && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [data.audioUrl]);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Get lifetime footprint-based impact metrics
  const impactMetrics = getCarbonImpactMetrics(data.carbonValue);
  const idealAnnual = getIdealAnnualFootprint();
  
  // Generate bell curve data for visualization
  // Shows distribution of typical product carbon footprints (in kg CO2e)
  // Most products fall in 0-100kg range, with mean around 10-20kg
  const carbonKg = data.carbonValue / 1000;
  const mean = 15; // Most products around 15kg
  const stdDev = 20; // Standard deviation
  const maxRange = 200; // Show up to 200kg on curve
  const bellCurveData = generateBellCurveData(mean, stdDev, 0, maxRange, 200);
  const maxY = Math.max(...bellCurveData.map(d => d.y));
  
  // Calculate position on bell curve (in kg)
  const positionOnCurve = Math.min(maxRange, carbonKg);

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Image & Main Impact */}
        <Card className="overflow-hidden mb-6 border-emerald-200">
          <div className="relative">
            <img 
              src={data.imageUrl} 
              alt={data.objectName}
              className="w-full h-64 object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{data.objectName}</h2>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-red-500 text-white">
                      {data.carbonFootprint}
                    </Badge>
                    <span className="text-white/80 text-sm">{impactMetrics.label}</span>
                  </div>
                </div>
                <Button
                  onClick={toggleAudio}
                  size="icon"
                  variant="secondary"
                  className="bg-white/90 hover:bg-white"
                >
                  {isPlaying ? (
                    <Volume2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-gray-600" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Hidden audio element */}
          {data.audioUrl && (
            <audio
              ref={audioRef}
              src={data.audioUrl}
              onEnded={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          )}

          {/* Carbon Impact Lifetime Visualization */}
          <div className="p-4 sm:p-6 bg-white">
            <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
              <div className="flex items-center gap-2 sm:gap-3">
                <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold text-emerald-900 text-sm sm:text-base">Lifetime Carbon Impact</span>
              </div>
              <Badge className={`${impactMetrics.color} text-white text-xs`}>
                {impactMetrics.label}
              </Badge>
            </div>
            
            {/* Bell Curve Visualization - Product Carbon Distribution */}
            <div className="relative mb-6">
              <div className="relative h-52 sm:h-56 bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 400 180" preserveAspectRatio="xMidYMid meet">
                  {/* Bell curve path */}
                  <path
                    d={bellCurveData.map((point, i) => {
                      const x = 20 + (point.x / maxRange) * 360;
                      const y = 130 - (point.y / maxY) * 110;
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="2"
                    className="drop-shadow-sm"
                  />
                  
                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="50%" stopColor="#eab308" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>
                  
                  {/* Fill area under curve */}
                  <path
                    d={`M 20 130 ${bellCurveData.map((point) => {
                      const x = 20 + (point.x / maxRange) * 360;
                      const y = 130 - (point.y / maxY) * 110;
                      return `L ${x} ${y}`;
                    }).join(' ')} L 380 130 Z`}
                    fill="url(#gradient)"
                    fillOpacity="0.2"
                  />
                  
                  {/* Current position indicator */}
                  <line
                    x1={20 + (positionOnCurve / maxRange) * 360}
                    y1="10"
                    x2={20 + (positionOnCurve / maxRange) * 360}
                    y2="130"
                    stroke="#000"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                  
                  {/* Indicator dot */}
                  <circle
                    cx={20 + (positionOnCurve / maxRange) * 360}
                    cy={130 - ((bellCurveData[Math.min(Math.round((positionOnCurve / maxRange) * 200), 200)]?.y || 0) / maxY) * 110}
                    r="5"
                    fill="#000"
                    stroke="#fff"
                    strokeWidth="2"
                  />
                  
                  {/* Labels on x-axis (kg CO2e) */}
                  {[0, 50, 100, 150, 200].filter(v => v <= maxRange).map((kg) => (
                    <g key={kg}>
                      <line
                        x1={20 + (kg / maxRange) * 360}
                        y1="130"
                        x2={20 + (kg / maxRange) * 360}
                        y2="138"
                        stroke="#6b7280"
                        strokeWidth="1"
                      />
                      <text
                        x={20 + (kg / maxRange) * 360}
                        y="152"
                        textAnchor="middle"
                        className="fill-gray-500"
                        fontSize="9"
                      >
                        {kg}kg
                      </text>
                    </g>
                  ))}
                  
                  {/* Baseline */}
                  <line x1="20" y1="130" x2="380" y2="130" stroke="#d1d5db" strokeWidth="1" />
                </svg>
                
                {/* Y-axis label */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -rotate-90 text-[10px] sm:text-xs text-gray-500 whitespace-nowrap origin-center">
                  Frequency
                </div>
              </div>
              
              {/* X-axis label */}
              <p className="text-center text-[10px] sm:text-xs text-gray-500 mt-1 sm:mt-2 px-2">
                Carbon Footprint (kg CO₂e) — Full Lifecycle
              </p>
            </div>
            
            {/* Impact description and stats */}
            <div className="space-y-3">
              <div className={`flex items-center gap-2 text-sm p-4 rounded-lg border ${
                impactMetrics.severity === 'extreme' || impactMetrics.severity === 'very-high' 
                  ? 'bg-red-50 border-red-200' 
                  : impactMetrics.severity === 'high'
                  ? 'bg-orange-50 border-orange-200'
                  : impactMetrics.severity === 'moderate'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-emerald-50 border-emerald-200'
              }`}>
                <AlertCircle className={`w-5 h-5 flex-shrink-0 ${
                  impactMetrics.severity === 'extreme' || impactMetrics.severity === 'very-high'
                    ? 'text-red-600'
                    : impactMetrics.severity === 'high'
                    ? 'text-orange-600'
                    : impactMetrics.severity === 'moderate'
                    ? 'text-yellow-600'
                    : 'text-emerald-600'
                }`} />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-1">What this means:</p>
                  <p className="text-gray-700">
                    {impactMetrics.description}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-200">
                <div className="text-center px-1">
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Product Total</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900">
                    {carbonKg >= 1 
                      ? `${carbonKg.toFixed(1)}kg`
                      : `${data.carbonValue.toFixed(0)}g`}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500">CO₂e</p>
                </div>
                <div className="text-center px-1">
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Your Budget</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900">4 tons</p>
                  <p className="text-[10px] sm:text-xs text-gray-500">per year</p>
                </div>
                <div className="text-center px-1">
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Item Uses</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900">
                    {impactMetrics.annualPercent.toFixed(2)}%
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500">of budget</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Explanation */}
        <Card className="p-6 mb-6 border-emerald-200">
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Leaf className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-emerald-900 mb-2">Environmental Impact</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{data.explanation}</p>
            </div>
          </div>
          
          {!data.audioUrl && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <VolumeX className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 mb-1">Audio Narration Coming Soon</p>
                <p className="text-yellow-700 text-xs">
                  Connect ElevenLabs API to enable documentary-style voice narration
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Carbon Comparisons - NEW */}
        <CarbonComparisons carbonValue={data.carbonValue} />

        {/* Lifecycle */}
        <Card className="p-6 my-6 border-emerald-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-teal-100 p-2 rounded-lg">
              <Recycle className="w-5 h-5 text-teal-600" />
            </div>
            <h3 className="font-semibold text-emerald-900">Product Lifecycle</h3>
          </div>
          
          <div className="space-y-3">
            {data.lifecycle.map((stage, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  {index < data.lifecycle.length - 1 && (
                    <div className="w-0.5 h-8 bg-emerald-200 my-1"></div>
                  )}
                </div>
                <div className="flex-1 pt-1.5">
                  <p className="text-sm text-gray-700">{stage}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Sustainable Alternatives */}
        <Card className="p-4 sm:p-6 mb-6 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-500 p-2 rounded-lg flex-shrink-0">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-emerald-900">Sustainable Alternatives</h3>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {data.alternatives.map((alt, index) => (
              <div key={index}>
                {index > 0 && <Separator className="my-3 sm:my-4" />}
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-emerald-200 overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-emerald-900 break-words">{alt.name}</h4>
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 text-xs flex-shrink-0 self-start whitespace-nowrap">
                      {alt.carbonSavings}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 break-words">{alt.benefit}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Integration Notes */}
        <Card className="p-6 mb-6 border-blue-200 bg-blue-50">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Integration Instructions
          </h4>
          <div className="space-y-3 text-sm">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <p className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Gemini Vision API
              </p>
              <code className="text-xs bg-gray-100 p-2 rounded block overflow-x-auto">
                POST /api/analyze → Send image → Get object ID & environmental data
              </code>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <p className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <Mic className="w-4 h-4" />
                ElevenLabs TTS API
              </p>
              <code className="text-xs bg-gray-100 p-2 rounded block overflow-x-auto">
                POST /api/narrate → Send explanation text → Get audio URL
              </code>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <p className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <Cloud className="w-4 h-4" />
                DigitalOcean Backend
              </p>
              <p className="text-xs text-gray-600">
                Host your API endpoints, object database, and inference logic on DigitalOcean
              </p>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="flex justify-center">
          <Button
            onClick={onScanAnother}
            size="lg"
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white gap-2"
          >
            <Camera className="w-5 h-5" />
            Scan Another Object
          </Button>
        </div>
      </div>
    </div>
  );
}