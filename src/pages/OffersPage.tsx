import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { ProductCard } from '../components/ProductCard';
import { mockProducts } from '../lib/mockData';
import { useFirebase } from '../context/FirebaseContext';
import { getProducts } from '../services/dataService';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { Flame, Clock, Tag, Sparkles } from 'lucide-react';

export default function OffersPage() {
  const { db } = useFirebase();
  const { setSelectedProduct } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [timeLeft, setTimeLeft] = useState({ hours: 8, minutes: 42, seconds: 15 });

  useEffect(() => {
    getProducts(db).then(data => {
      if (data.length > 0) setProducts(data);
      else setProducts(mockProducts);
    });
  }, [db]);

  // Countdown clock effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              // Reset clock for demo loop
              hours = 23;
              minutes = 59;
              seconds = 59;
            }
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Filter products that are explicitly discounted
  const discountedProducts = products.filter(p => p.discountPrice && p.discountPrice < p.price);

  return (
    <Layout>
      <div className="py-12 px-6 max-w-7xl mx-auto">
        
        {/* Banner de Ofertas Relámpago (Flash Sale) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950/40 via-purple-950/20 to-black border border-red-500/20 p-8 md:p-12 mb-16">
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
            <div className="space-y-4">
              <div className="inline-flex gap-1.5 items-center px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-[10px] uppercase tracking-widest">
                <Flame size={12} className="fill-red-400 animate-pulse" />
                <span>Liquidación Flash 24 Horas</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-display font-black leading-none uppercase tracking-tight">
                PROMOS <span className="text-primary italic">DEL DÍA</span>
              </h1>
              <p className="text-gray-400 max-w-lg text-sm leading-relaxed">
                Aprovechá estos precios seleccionados por tiempo limitado. Descuentos imperdibles en teteras, vajilla de diseño y cristalería prémium de Paraná, Entre Ríos.
              </p>
            </div>
            
            {/* Live Timer */}
            <div className="glass p-6 rounded-2xl border border-white/10 flex items-center gap-6 shrink-0 shadow-2xl bg-black/40 backdrop-blur-md">
              <div className="text-center w-16">
                <div className="text-4xl font-display font-black text-primary">
                  {timeLeft.hours.toString().padStart(2, '0')}
                </div>
                <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Horas</div>
              </div>
              <div className="text-2xl font-black text-gray-700 animate-pulse">:</div>
              
              <div className="text-center w-16">
                <div className="text-4xl font-display font-black text-primary">
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </div>
                <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Minutos</div>
              </div>
              <div className="text-2xl font-black text-gray-700 animate-pulse">:</div>
              
              <div className="text-center w-16">
                <div className="text-4xl font-display font-black text-primary">
                  {timeLeft.seconds.toString().padStart(2, '0')}
                </div>
                <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Segundos</div>
              </div>
            </div>
          </div>
        </div>

        {/* List of discounted offers */}
        <div className="mb-12">
          <div className="badge inline-flex gap-1 items-center mb-3">
            <Tag size={12} className="text-primary" />
            <span>OFERTAS DE HOY, STOCK DISPONIBLE</span>
          </div>
          <h2 className="text-3xl font-display font-black uppercase tracking-tight">
            NUESTRAS <span className="text-accent italic">LIQUIDACIONES</span>
          </h2>
        </div>

        {discountedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {discountedProducts.map((product, idx) => (
              <div key={product.id} onClick={() => setSelectedProduct(product)} className="cursor-pointer">
                <ProductCard product={product} index={idx} />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center glass rounded-3xl border border-white/5">
            <Sparkles size={32} className="text-primary mx-auto mb-4 animate-spin" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Pronto tendremos nuevas ofertas de Bazar YES en Paraná.</p>
            <p className="text-xs text-gray-500 mt-2">Visita la pestaña productos para ver todo nuestro catálogo disponible de inmediato.</p>
          </div>
        )}

      </div>
    </Layout>
  );
}
