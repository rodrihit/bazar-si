import Layout from '../components/Layout';
import AboutUs from '../components/AboutUs';
import GoogleMap from '../components/Map';
import { motion } from 'motion/react';
import { Sparkles, Calendar, MessageSquare, ShieldCheck } from 'lucide-react';

export default function AboutPage() {
  return (
    <Layout>
      <div className="py-12">
        {/* About Header */}
        <div className="max-w-7xl mx-auto px-6 mb-12">
          <div className="badge flex gap-1.5 items-center w-fit mb-4">
            <Calendar size={12} className="text-primary" />
            <span>Desde 1985 en Paraná</span>
          </div>
          <h1 className="text-4xl font-display font-black uppercase tracking-tight">
            NUESTRA <span className="text-primary italic">FAMILIA</span>
          </h1>
          <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase mt-1">
            Conocé nuestra historia, el local de Alem 110 y cómo llegar cómodamente en auto.
          </p>
        </div>

        {/* Core Content */}
        <AboutUs />

        {/* Local Map Interaction */}
        <div className="border-t border-white/5 pt-12 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 mb-8 text-center sm:text-left">
            <h2 className="text-2xl font-display font-black uppercase tracking-tight">
              ¿DÓNDE <span className="text-primary italic">ENCONTRARNOS?</span>
            </h2>
            <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase mt-0.5">
              Te esperamos de Lunes a Sábados para brindarte la mejor atención.
            </p>
          </div>
          <GoogleMap />
        </div>
      </div>
    </Layout>
  );
}
