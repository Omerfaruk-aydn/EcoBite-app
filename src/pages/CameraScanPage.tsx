import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Flashlight, Image as ImageIcon } from 'lucide-react';
import { detectIngredients } from '../api/openaiVision';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/ui/Button';
import type { DetectedIngredient } from '../types';

export const CameraScanPage: React.FC = () => {
  const navigate = useNavigate();
  const { setScannedIngredients } = useAppStore();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedItems, setDetectedItems] = useState<DetectedIngredient[]>([]);
  const [shutterFlash, setShutterFlash] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  // Initialize Camera
  useEffect(() => {
    const startCamera = async () => {
      // Check for Secure Context (Required for getUserMedia)
      if (!window.isSecureContext && window.location.hostname !== 'localhost') {
        setError('Güvenli Bağlantı Gerekli (HTTPS). Kamera HTTP üzerinden çalışmaz.');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        streamRef.current = stream;

        // Check for torch capability
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities() as any;
        if (capabilities && capabilities.torch) {
          setHasTorch(true);
        }
      } catch (err: any) {
        console.error('Kamera erişim hatası:', err);
        if (err.name === 'NotAllowedError') {
          setError('Kamera izni reddedildi. Lütfen tarayıcı ayarlarından izin verin.');
        } else {
          setError('Kameraya erişilemedi. Başka bir uygulama kamerayı kullanıyor olabilir.');
        }
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleTorch = async () => {
    if (!streamRef.current || !hasTorch) return;
    const track = streamRef.current.getVideoTracks()[0];
    
    try {
      await track.applyConstraints({
        advanced: [{ torch: !torchOn } as any]
      });
      setTorchOn(!torchOn);
    } catch (err) {
      console.error('El feneri hatası:', err);
    }
  };

  const processImage = async (base64Image: string) => {
    setIsDetecting(true);
    setError(null);
    try {
      const items = await detectIngredients(base64Image);
      setDetectedItems(items);
      setScannedIngredients(items);
      setShowBottomSheet(true);
    } catch (err) {
      setError('Algılama başarısız oldu. Lütfen tekrar deneyin.');
      console.error(err);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current) {
      console.error('Video element bulunamadı');
      return;
    }
    
    // Visual feedback
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 100);

    // Create canvas to capture frame
    const canvas = document.createElement('canvas');
    
    // Get actual dimensions, fallback to 1280x720 if zeros
    const width = videoRef.current.videoWidth || 1280;
    const height = videoRef.current.videoHeight || 720;
    
    console.log(`Fotoğraf çekiliyor: ${width}x${height}`);
    
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setError('Kamera görüntüsü yakalanamadı (Context Hatası)');
      return;
    }
    
    try {
      ctx.drawImage(videoRef.current, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      const base64Image = dataUrl.split(',')[1];
      
      if (!base64Image) {
        throw new Error('Görüntü verisi boş');
      }
      
      processImage(base64Image);
    } catch (err) {
      console.error('Çekim hatası:', err);
      setError('Fotoğraf çekilemedi. Lütfen tekrar deneyin.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = (event.target?.result as string).split(',')[1];
      processImage(base64String);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      
      {/* Shutter Flash Animation */}
      <AnimatePresence>
        {shutterFlash && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-white pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-5 pt-12">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      {/* Camera Feed */}
      <div className="absolute inset-0 z-0 h-full w-full">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Viewfinder Overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <div className="w-[320px] h-[320px] relative">
          {/* Animated Corners - Thinner & Sleeker */}
          <motion.div 
            animate={{ opacity: [0.4, 1, 0.4] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-1 -left-1 w-16 h-16 border-t-[1.5px] border-l-[1.5px] border-white/80 rounded-tl-3xl" 
          />
          <motion.div 
            animate={{ opacity: [0.4, 1, 0.4] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-1 -right-1 w-16 h-16 border-t-[1.5px] border-r-[1.5px] border-white/80 rounded-tr-3xl" 
          />
          <motion.div 
            animate={{ opacity: [0.4, 1, 0.4] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -bottom-1 -left-1 w-16 h-16 border-b-[1.5px] border-l-[1.5px] border-white/80 rounded-bl-3xl" 
          />
          <motion.div 
            animate={{ opacity: [0.4, 1, 0.4] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -bottom-1 -right-1 w-16 h-16 border-b-[1.5px] border-r-[1.5px] border-white/80 rounded-br-3xl" 
          />
          
          {/* Scan Line - Subtle Glow */}
          {isDetecting && (
            <motion.div 
              animate={{ y: [0, 318, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
              className="absolute top-0 left-0 right-0 h-[1.5px] bg-white/80 shadow-[0_0_15px_rgba(255,255,255,0.8)]" 
            />
          )}

          {/* Floating Tags (Mockup Style) */}
          <div className="absolute inset-0 flex items-center justify-center">
             <AnimatePresence>
              {isDetecting && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white/20 backdrop-blur-xl border border-white/30 px-6 py-3 rounded-2xl flex flex-col items-center gap-2"
                >
                  <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-white font-heading font-bold text-sm tracking-wide">Analiz Ediliyor...</span>
                </motion.div>
              )}
             </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Floating Detection Results (Mockup Style) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 z-20 w-full px-10 pointer-events-none">
        <div className="flex flex-wrap gap-2 justify-center">
          <AnimatePresence>
            {detectedItems.map((item, index) => (
              <motion.div
                key={item.en + index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-white/25 backdrop-blur-md border border-white/40 px-4 py-1.5 rounded-full shadow-lg"
              >
                <span className="text-white font-heading font-bold text-xs uppercase tracking-wider">{item.tr}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Panel (High-End Glassmorphism) */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-6 pb-10">
        <div className="bg-white/10 backdrop-blur-[24px] backdrop-saturate-[1.8] border border-white/20 rounded-[40px] p-6 shadow-2xl overflow-hidden relative">
          {/* Subtle Inner Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex items-center justify-between">
            {/* Flash Toggle */}
            {hasTorch ? (
              <button 
                onClick={toggleTorch}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                  torchOn ? 'bg-white text-brand-primary shadow-lg scale-110' : 'bg-black/20 text-white border border-white/20'
                }`}
              >
                <Flashlight size={24} />
              </button>
            ) : (
              <div className="w-14" /> // Placeholder to maintain flex layout
            )}

            {/* Shutter Button - Premium Polish */}
            <div className="relative flex items-center justify-center">
              {/* Outer Ring */}
              <div className="absolute w-[100px] h-[100px] rounded-full border border-white/30 animate-pulse" />
              <button 
                onClick={handleCapture}
                disabled={isDetecting}
                className="group relative w-22 h-22 rounded-full border-[6px] border-white/40 flex items-center justify-center disabled:opacity-50 active:scale-95 transition-transform"
              >
                <div className="w-18 h-18 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)] group-hover:scale-105 transition-transform" />
              </button>
            </div>

            {/* Gallery Upload */}
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-14 h-14 rounded-full bg-black/20 text-white border border-white/20 flex items-center justify-center transition-all hover:bg-black/30"
            >
              <ImageIcon size={24} />
            </button>
          </div>

          {/* Status Label (Minimalist) */}
          <div className="mt-6 text-center">
             <span className="text-white/60 font-body text-xs font-semibold tracking-widest uppercase">
               {error || (isDetecting ? 'Yapay Zeka Hazırlanıyor' : 'Kamerayı Odaklayın')}
             </span>
          </div>
        </div>
      </div>

      {/* Bottom Sheet Modal for Actions after detection */}
      {showBottomSheet && detectedItems.length > 0 && (
        <div className="absolute inset-0 z-30 bg-black/40 flex items-end">
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            className="w-full bg-white rounded-t-4xl p-6 pb-12"
          >
            <h3 className="font-heading font-bold text-xl text-center mb-6">Sonraki Adım</h3>
            <div className="flex flex-col gap-3">
              <Button 
                fullWidth 
                onClick={() => navigate('/recipes-search')}
              >
                Tarifleri Bul
              </Button>
              <Button 
                fullWidth 
                variant="outline"
                onClick={() => {
                  setShowBottomSheet(false);
                  setDetectedItems([]);
                }}
              >
                Yeniden Tara
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
