import { useState, useRef, useEffect } from 'react';
import { Camera, Volume2, VolumeX, Leaf, TrendingDown, Lightbulb, Recycle } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Separator } from '@/app/components/ui/separator';
import { CarbonComparisons } from '@/app/components/CarbonComparisons';
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

  const getCarbonLevel = (value: number): { label: string; color: string; progress: number } => {
    if (value < 50) return { label: 'Low Impact', color: 'bg-green-500', progress: 33 };
    if (value < 200) return { label: 'Medium Impact', color: 'bg-yellow-500', progress: 66 };
    return { label: 'High Impact', color: 'bg-red-500', progress: 100 };
  };

  const carbonLevel = getCarbonLevel(data.carbonValue);

  return (
    <div className="container mx-auto px-4 py-8">
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
                    <span className="text-white/80 text-sm">{carbonLevel.label}</span>
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

          {/* Carbon Impact Bar */}
          <div className="p-6 bg-white">
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown className="w-5 h-5 text-emerald-600" />
              <span className="font-semibold text-emerald-900">Carbon Footprint</span>
            </div>
            <Progress value={carbonLevel.progress} className="h-3 mb-2" />
            <p className="text-xs text-gray-600">
              Compared to similar products in its category
            </p>
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
        <Card className="p-6 mb-6 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-emerald-900">Sustainable Alternatives</h3>
          </div>
          
          <div className="space-y-4">
            {data.alternatives.map((alt, index) => (
              <div key={index}>
                {index > 0 && <Separator className="my-4" />}
                <div className="bg-white rounded-lg p-4 border border-emerald-200">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-emerald-900">{alt.name}</h4>
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                      {alt.carbonSavings}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{alt.benefit}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Integration Notes */}
        <Card className="p-6 mb-6 border-blue-200 bg-blue-50">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <span className="text-lg">🔧</span>
            Integration Instructions
          </h4>
          <div className="space-y-3 text-sm">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <p className="font-medium text-blue-900 mb-2">📸 Gemini Vision API</p>
              <code className="text-xs bg-gray-100 p-2 rounded block overflow-x-auto">
                POST /api/analyze → Send image → Get object ID & environmental data
              </code>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <p className="font-medium text-blue-900 mb-2">🎙️ ElevenLabs TTS API</p>
              <code className="text-xs bg-gray-100 p-2 rounded block overflow-x-auto">
                POST /api/narrate → Send explanation text → Get audio URL
              </code>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <p className="font-medium text-blue-900 mb-2">☁️ DigitalOcean Backend</p>
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