import { motion } from 'motion/react';
import { Clock, TrendingUp } from 'lucide-react';
import { mockProducts } from '../lib/mockData';
import { formatCurrency } from '../lib/utils';
import { ProductCard } from './ProductCard';

export default function Promotions() {
  const promoProducts = mockProducts.filter(p => p.dailyPromo);

  return (
    <section id="promociones" className="py-24 px-6 bg-gradient-to-b from-transparent to-white/[0.02]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <div className="badge">
              Flash Sale
            </div>
            <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tight leading-[0.9]">
              PROMOS <span className="text-primary italic">DEL DÍA</span>
            </h2>
            <p className="text-gray-400 max-w-sm text-sm">Aprovechá estos precios exclusivos por tiempo limitado.</p>
          </div>
          
          <div className="flex items-center gap-6 glass p-6 rounded-xl">
            <div className="text-center">
              <div className="text-3xl font-display font-black text-primary">08</div>
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Horas</div>
            </div>
            <div className="text-2xl font-black text-gray-700">:</div>
            <div className="text-center">
              <div className="text-3xl font-display font-black text-primary">42</div>
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Minutos</div>
            </div>
            <div className="text-2xl font-black text-gray-700">:</div>
            <div className="text-center">
              <div className="text-3xl font-display font-black text-primary">15</div>
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Segundos</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {promoProducts.map((product, idx) => (
            <div key={product.id}>
              {/* Note: In a real app, I'd lift the setSelectedProduct state or use a context, 
                  but for this turn I'll pass the handler via a direct prop if it existed or 
                  rely on the LandingPage wrapper which already has it. 
                  However, Promotions is inside LandingPage, so the click will propagate if wrapped. */}
              <ProductCard product={product} index={idx} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
