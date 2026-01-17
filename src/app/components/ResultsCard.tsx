import { motion } from 'motion/react';
import { Leaf, Droplets, Recycle, Volume2, VolumeX, Lightbulb } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';

export interface ObjectAnalysis {
  name: string;
  category: string;
  carbonFootprint: number; // in grams CO2
  waterUsage: number; // in liters
  recyclable: boolean;
  lifespanYears: number;
  explanation: string;
  alternatives: Array<{
    name: string;
    carbonSavings: number; // percentage
    description: string;
  }>;
}

interface ResultsCardProps {
  analysis: ObjectAnalysis;
  imageData: string;
  isSpeaking: boolean;
  onToggleSpeech: () => void;
  onNewScan: () => void;
}

export function ResultsCard({ 
  analysis, 
  imageData, 
  isSpeaking,
  onToggleSpeech,
  onNewScan 
}: ResultsCardProps) {
  const impactLevel = analysis.carbonFootprint > 500 ? 'high' : 
                       analysis.carbonFootprint > 100 ? 'medium' : 'low';

  const impactColors = {
    high: 'text-red-600 bg-red-50',
    medium: 'text-orange-600 bg-orange-50',
    low: 'text-green-600 bg-green-50'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-emerald-50 to-white p-4 pb-24"
    >
      {/* Image Preview */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative mb-4 rounded-2xl overflow-hidden shadow-lg"
      >
        <img 
          src={imageData} 
          alt="Captured object" 
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 right-3">
          <Badge className={`${impactColors[impactLevel]} border-0`}>
            {impactLevel.toUpperCase()} IMPACT
          </Badge>
        </div>
      </motion.div>

      {/* Object Name & Category */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-4"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-1">{analysis.name}</h1>
        <p className="text-gray-500">{analysis.category}</p>
      </motion.div>

      {/* Voice Control */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <Button
          onClick={onToggleSpeech}
          variant="outline"
          size="sm"
          className="w-full border-emerald-600 text-emerald-700 hover:bg-emerald-50"
        >
          {isSpeaking ? (
            <>
              <VolumeX className="mr-2 h-4 w-4" />
              Stop Narration
            </>
          ) : (
            <>
              <Volume2 className="mr-2 h-4 w-4" />
              Hear Analysis
            </>
          )}
        </Button>
      </motion.div>

      {/* Environmental Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-2 gap-3 mb-6"
      >
        <Card className="p-4 border-emerald-100 bg-white">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Leaf className="h-5 w-5 text-emerald-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-1">Carbon Footprint</p>
              <p className="text-lg font-bold text-gray-900">
                {analysis.carbonFootprint}g CO₂
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-blue-100 bg-white">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Droplets className="h-5 w-5 text-blue-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-1">Water Usage</p>
              <p className="text-lg font-bold text-gray-900">
                {analysis.waterUsage}L
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-purple-100 bg-white">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Recycle className="h-5 w-5 text-purple-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-1">Recyclable</p>
              <p className="text-lg font-bold text-gray-900">
                {analysis.recyclable ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-amber-100 bg-white">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Lightbulb className="h-5 w-5 text-amber-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-1">Lifespan</p>
              <p className="text-lg font-bold text-gray-900">
                {analysis.lifespanYears} {analysis.lifespanYears === 1 ? 'year' : 'years'}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Explanation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-6"
      >
        <Card className="p-4 bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
          <h3 className="font-semibold text-gray-900 mb-2">Environmental Impact</h3>
          <p className="text-gray-700 text-sm leading-relaxed">{analysis.explanation}</p>
        </Card>
      </motion.div>

      {/* Alternatives */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mb-6"
      >
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Leaf className="h-5 w-5 text-emerald-600" />
          Greener Alternatives
        </h3>
        <div className="space-y-3">
          {analysis.alternatives.map((alt, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
            >
              <Card className="p-4 border-emerald-100 hover:border-emerald-300 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="font-semibold text-gray-900">{alt.name}</h4>
                  <Badge className="bg-emerald-600 text-white border-0 shrink-0">
                    -{alt.carbonSavings}% CO₂
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{alt.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* New Scan Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="fixed bottom-6 left-4 right-4"
      >
        <Button
          onClick={onNewScan}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg shadow-lg"
        >
          Scan Another Object
        </Button>
      </motion.div>
    </motion.div>
  );
}
