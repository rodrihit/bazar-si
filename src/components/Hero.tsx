import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkles, X, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

const FALLBACK_HERO_IMAGE = '/images/hero-bazar.png';
// URLs externas viejas que ya no funcionan: si están guardadas en localStorage, las ignoramos.
const BROKEN_HERO_IMAGES = [
  'https://images.unsplash.com/photo-1544190807-c19956461c3c'
];

export default function Hero({ onDealsClick }: { onDealsClick: () => void }) {
  const navigate = useNavigate();
  const [heroImage, setHeroImage] = useState(FALLBACK_HERO_IMAGE);
  const [heroBg, setHeroBg] = useState('https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1600');
  const [heroVideo, setHeroVideo] = useState('https://assets.mixkit.co/videos/preview/mixkit-kitchen-interior-with-modern-furniture-and-plants-41584-large.mp4');
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  useEffect(() => {
    const savedImg = localStorage.getItem('bazar_yes_hero_image');
    const savedBg = localStorage.getItem('bazar_yes_hero_bg');
    const savedVid = localStorage.getItem('bazar_yes_hero_video');
    const isBrokenSaved = savedImg && BROKEN_HERO_IMAGES.some((u) => savedImg.startsWith(u));
    if (savedImg && !isBrokenSaved) setHeroImage(savedImg);
    if (savedBg) setHeroBg(savedBg);
    if (savedVid) setHeroVideo(savedVid);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 opacity-55">
         <img 
          src={heroBg} 
          className="w-full h-full object-cover brightness-[0.45] contrast-105"
          referrerPolicy="no-referrer"
          alt="Bazar YES Ambiente"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/40 to-background" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] uppercase tracking-[0.2em] font-black text-primary mb-6">
            <Sparkles size={14} />
            Renová tu hogar
          </div>
          <h1 className="text-5xl md:text-8xl font-display font-black leading-[0.95] tracking-tight mb-6">
            TODO LO QUE <br />
            <span className="text-primary italic">NECESITÁS</span> <br />
            <span className="text-white">EN UN SOLO LUGAR.</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-sm leading-relaxed mb-10 opacity-80 animate-pulse">
            Desde 1985 ofreciendo la mayor variedad de bazar y regalería en el corazón de Paraná.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => navigate('/productos')}
              className="bg-primary text-black px-8 py-3.5 rounded-xl font-bold uppercase text-[12px] tracking-widest flex items-center gap-2 hover:scale-105 transition-transform group shadow-lg shadow-primary/20"
            >
              Ver Destacados
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => setIsPlayerOpen(true)}
              className="border border-white/25 text-white px-8 py-3.5 rounded-xl font-bold uppercase text-[12px] tracking-widest hover:bg-white/10 transition-all flex items-center gap-2 hover:border-primary"
            >
              <Play size={14} className="fill-white" />
              Conocenos
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative hidden md:block"
        >
          <div className="relative z-10 rounded-3xl overflow-hidden aspect-square glass shadow-2xl border border-white/10">
             <img 
              src={heroImage} 
              alt="Bazar Premium" 
              className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700 pointer-events-none"
              referrerPolicy="no-referrer"
              onError={(e) => {
                if (e.currentTarget.src !== window.location.origin + FALLBACK_HERO_IMAGE) {
                  e.currentTarget.src = FALLBACK_HERO_IMAGE;
                }
              }}
             />
          </div>
          
          {/* Floating Stats */}
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            onClick={onDealsClick}
            className="absolute -top-6 -right-6 glass p-6 rounded-2xl z-20 flex flex-col items-center cursor-pointer hover:scale-110 hover:border-primary/50 transition-all active:scale-95"
          >
            <div className="text-accent font-black text-3xl font-display">60%</div>
            <div className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em]">OFF BAZAR</div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute -bottom-6 -left-6 glass p-5 rounded-2xl z-20 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-lg animate-pulse">
              <Sparkles size={24} />
            </div>
            <div>
              <div className="font-bold text-sm text-white">Desde 1985</div>
              <div className="text-[10px] text-gray-400 uppercase font-black">Histórico en Paraná</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
        <div className="w-12 h-1 bg-primary rounded-full" />
        <div className="w-4 h-1 bg-white/20 rounded-full" />
        <div className="w-4 h-1 bg-white/20 rounded-full" />
      </div>

      {/* Video Presentation Modal popup */}
      <AnimatePresence>
        {isPlayerOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
          >
            {/* Close trigger overlay */}
            <div className="absolute inset-0" onClick={() => setIsPlayerOpen(false)} />

            {/* Video container card */}
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-[#0f0f11]/90 rounded-3xl border border-white/10 p-4 md:p-6 shadow-2xl z-20 overflow-hidden"
            >
              {/* Header inside modal */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                <div>
                  <h3 className="text-xs uppercase font-black text-primary tracking-widest flex items-center gap-2">
                    <Sparkles size={12} className="animate-spin" />
                    Bazar YES Paraná
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Te invitamos a conocer las puertas de nuestro salón de ventas</p>
                </div>
                
                <button 
                  onClick={() => setIsPlayerOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 flex items-center justify-center transition-all border border-white/5 active:scale-95"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Video Player aspect ratio ratio frame container */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/80 border border-white/5">
                {heroVideo ? (
                  <video 
                    src={heroVideo}
                    autoPlay
                    controls
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-black/95">
                    <p className="text-gray-400 text-xs font-bold uppercase">No se ha cargado un video de presentación.</p>
                    <p className="text-[10px] text-gray-600 uppercase mt-1">Cargá un video de muestra desde el panel de Administración.</p>
                  </div>
                )}
              </div>

              {/* Footer info inside modal */}
              <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2 text-[9px] uppercase font-black tracking-widest text-gray-500">
                <span>📍 Alem 110, Paraná, Entre Ríos, Argentina</span>
                <span className="text-primary italic hover:underline cursor-pointer" onClick={() => navigate('/nosotros')}>Ver Información de Contacto →</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
