import { useState, useRef, useEffect } from 'react';
import { Camera as CameraIcon, X, FlipHorizontal, Upload } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface CameraProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

export function Camera({ onCapture, onClose }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [error, setError] = useState<string>('');
  const [showUploadOption, setShowUploadOption] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      setError('');
      setShowUploadOption(false);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setError('Camera access denied. You can upload a photo instead.');
      } else {
        setError('Unable to access camera. You can upload a photo instead.');
      }
      setShowUploadOption(true);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.95);
    stopCamera();
    onCapture(imageData);
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      stopCamera();
      onCapture(imageData);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/20"
        >
          <X className="h-6 w-6" />
        </Button>
        {!error && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCamera}
            className="text-white hover:bg-white/20"
          >
            <FlipHorizontal className="h-6 w-6" />
          </Button>
        )}
      </div>

      {/* Camera view */}
      <div className="flex-1 relative overflow-hidden">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center text-white text-center p-8">
            <div className="max-w-sm">
              <CameraIcon className="h-16 w-16 mx-auto mb-4 text-white/60" />
              <p className="text-lg mb-6">{error}</p>
              <div className="space-y-3">
                <Button 
                  onClick={triggerFileUpload} 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Photo
                </Button>
                <Button 
                  onClick={startCamera} 
                  variant="outline" 
                  className="w-full text-white border-white hover:bg-white/20"
                >
                  Try Camera Again
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Capture button */}
      <div className="absolute bottom-0 left-0 right-0 pb-8 pt-6 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center justify-center gap-4">
          {showUploadOption && (
            <Button
              size="icon"
              onClick={triggerFileUpload}
              className="h-16 w-16 rounded-full bg-emerald-600 hover:bg-emerald-700 border-4 border-white/30"
            >
              <Upload className="h-6 w-6 text-white" />
            </Button>
          )}
          <Button
            size="icon"
            onClick={captureImage}
            disabled={!!error}
            className="h-20 w-20 rounded-full bg-white hover:bg-white/90 border-4 border-white/30 disabled:opacity-50"
          >
            <CameraIcon className="h-8 w-8 text-black" />
          </Button>
        </div>
      </div>
    </div>
  );
}