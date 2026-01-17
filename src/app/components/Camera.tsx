import { useRef, useState, useEffect } from 'react';
import { Camera as CameraIcon, X, RefreshCw } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';

interface CameraProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
  isAnalyzing: boolean;
}

export function Camera({ onCapture, onClose, isAnalyzing }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  useEffect(() => {
    startCamera();
    
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setStream(mediaStream);
      setError('');
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please grant camera permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(imageData);
      }
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Camera Error</h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      
      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Overlay UI */}
      <div className="absolute inset-0 flex flex-col">
        {/* Top Bar */}
        <div className="bg-gradient-to-b from-black/60 to-transparent p-4 flex items-center justify-between">
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            disabled={isAnalyzing}
          >
            <X className="w-6 h-6" />
          </Button>
          
          <div className="text-white text-center">
            <p className="text-sm font-medium">Position object in frame</p>
            <p className="text-xs opacity-80">Tap to capture</p>
          </div>
          
          <Button
            onClick={switchCamera}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            disabled={isAnalyzing}
          >
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>

        {/* Center Guide */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm aspect-square">
            {/* Corner guides */}
            <div className="absolute inset-0 border-2 border-white/40 rounded-2xl">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-2xl"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-2xl"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-2xl"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-2xl"></div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="bg-gradient-to-t from-black/60 to-transparent p-8 flex items-center justify-center">
          <Button
            onClick={captureImage}
            disabled={isAnalyzing}
            className="w-20 h-20 rounded-full bg-white hover:bg-gray-100 border-4 border-emerald-400 p-0 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <div className="w-full h-full rounded-full bg-emerald-400 animate-pulse flex items-center justify-center">
                <span className="text-white text-xs">Analyzing...</span>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <CameraIcon className="w-8 h-8 text-emerald-600" />
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* Analyzing Overlay */}
      {isAnalyzing && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-semibold">Analyzing with Gemini AI...</p>
            <p className="text-sm opacity-80 mt-2">Calculating environmental impact</p>
          </div>
        </div>
      )}
    </div>
  );
}
