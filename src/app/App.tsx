import { useState, useEffect } from 'react';
import { Leaf, Camera as CameraIcon, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/app/components/ui/button';
import { Camera } from '@/app/components/Camera';
import { ResultsCard } from '@/app/components/ResultsCard';
import { ObjectAnalysis } from '@/app/components/ResultsCard';
import { identifyObject } from '@/app/utils/objectDatabase';
import { ttsService } from '@/app/utils/textToSpeech';

type AppState = 'home' | 'camera' | 'results' | 'analyzing';

export default function App() {
  const [state, setState] = useState<AppState>('home');
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [analysis, setAnalysis] = useState<ObjectAnalysis | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Load voices on mount
  useEffect(() => {
    // Ensure voices are loaded (some browsers require this)
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // Check speaking state
  useEffect(() => {
    const interval = setInterval(() => {
      setIsSpeaking(ttsService.isSpeaking());
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleOpenCamera = () => {
    setState('camera');
  };

  const handleCapture = (imageData: string) => {
    setCapturedImage(imageData);
    setState('analyzing');

    // Simulate AI processing
    setTimeout(() => {
      const result = identifyObject(imageData);
      setAnalysis(result);
      setState('results');
    }, 2000);
  };

  const handleCloseCamera = () => {
    setState('home');
  };

  const handleNewScan = () => {
    ttsService.cancel();
    setCapturedImage('');
    setAnalysis(null);
    setState('home');
  };

  const handleToggleSpeech = () => {
    if (isSpeaking) {
      ttsService.cancel();
    } else if (analysis) {
      ttsService.speak(analysis);
    }
  };

  if (state === 'camera') {
    return <Camera onCapture={handleCapture} onClose={handleCloseCamera} />;
  }

  if (state === 'analyzing') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-4"
          >
            <Sparkles className="h-16 w-16 text-emerald-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Object...</h2>
          <p className="text-gray-600">Calculating environmental impact</p>
        </motion.div>
      </div>
    );
  }

  if (state === 'results' && analysis) {
    return (
      <ResultsCard
        analysis={analysis}
        imageData={capturedImage}
        isSpeaking={isSpeaking}
        onToggleSpeech={handleToggleSpeech}
        onNewScan={handleNewScan}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-600 via-emerald-500 to-emerald-400 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 left-10 text-white/10"
        >
          <Leaf className="h-32 w-32" />
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-20 right-10 text-white/10"
        >
          <Leaf className="h-40 w-40" />
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, 3, 0]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/2 right-20 text-white/10"
        >
          <Leaf className="h-24 w-24" />
        </motion.div>
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center z-10 max-w-md"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: 'spring',
            stiffness: 260,
            damping: 20,
            delay: 0.2 
          }}
          className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6 shadow-lg"
        >
          <Leaf className="h-10 w-10 text-emerald-600" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-5xl font-bold text-white mb-3"
        >
          EcoLens
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-xl text-emerald-50 mb-12"
        >
          See the environmental cost of everyday objects
        </motion.p>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4 mb-12"
        >
          {[
            '📸 Point your camera at any object',
            '🌍 Learn its carbon footprint',
            '🎙️ Hear the story explained',
            '♻️ Discover greener alternatives'
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="text-white/90 text-lg"
            >
              {feature}
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
        >
          <Button
            onClick={handleOpenCamera}
            size="lg"
            className="w-full bg-white text-emerald-700 hover:bg-emerald-50 text-lg py-7 shadow-xl hover:shadow-2xl transition-all"
          >
            <CameraIcon className="mr-2 h-6 w-6" />
            Start Scanning
          </Button>
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-emerald-100 text-sm mt-8"
        >
          Make informed choices. Reduce your impact. 🌱
        </motion.p>
      </motion.div>
    </div>
  );
}
