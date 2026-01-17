import { Camera as CameraIcon, Sparkles } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { motion } from 'motion/react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const examples = [
    { emoji: '☕', label: 'Coffee Cup' },
    { emoji: '💻', label: 'Laptop' },
    { emoji: '👟', label: 'Shoes' },
    { emoji: '📱', label: 'Phone' },
    { emoji: '🍔', label: 'Food' },
    { emoji: '👕', label: 'Clothing' }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-in fade-in duration-700">
            <Sparkles className="w-4 h-4" />
            UOttaHackathon 2026
          </div>
          
          <h2 className="text-5xl font-bold text-emerald-900 mb-4 animate-in fade-in duration-700 delay-100">
            Discover the True Cost
            <br />
            of Everyday Objects 🌍
          </h2>
          
          <p className="text-lg text-emerald-700 mb-8 animate-in fade-in duration-700 delay-200">
            Point your camera at any object and instantly learn its environmental impact,
            lifecycle story, and sustainable alternatives.
          </p>
          
          <Button
            onClick={onStart}
            size="lg"
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-6 text-lg gap-3 shadow-lg hover:shadow-xl transition-all animate-in fade-in duration-700 delay-300"
          >
            <CameraIcon className="w-6 h-6" />
            Start Scanning
          </Button>
        </div>

        {/* How It Works */}
        <Card className="p-6 mb-8 border-emerald-200 bg-white/50 backdrop-blur">
          <h3 className="font-semibold text-emerald-900 mb-4">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">📸</span>
              </div>
              <p className="text-sm text-emerald-700">
                <strong>Scan</strong><br />
                Point & capture
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">🤖</span>
              </div>
              <p className="text-sm text-emerald-700">
                <strong>Analyze</strong><br />
                AI identifies & calculates
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">🌱</span>
              </div>
              <p className="text-sm text-emerald-700">
                <strong>Learn</strong><br />
                Hear impact & alternatives
              </p>
            </div>
          </div>
        </Card>

        {/* Examples */}
        <div className="mb-8">
          <p className="text-sm text-emerald-600 mb-4">Try scanning these objects:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {examples.map((item, index) => (
              <motion.div
                key={item.label}
                className="bg-white border border-emerald-200 rounded-lg px-4 py-2 flex items-center gap-2 hover:border-emerald-400 transition-colors"
                animate={{
                  y: [0, -8, 0],
                  x: [0, index % 2 === 0 ? 4 : -4, 0],
                }}
                transition={{
                  duration: 3 + index * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.3,
                }}
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-sm text-emerald-700">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg p-6 border border-emerald-200">
          <p className="text-xs text-emerald-600 mb-3">Powered by</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-emerald-700">Google Gemini AI</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
              <span className="text-emerald-700">ElevenLabs Voice</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-emerald-700">DigitalOcean</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}