import { motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { categories } from '../lib/mockData';
import { cn } from '../lib/utils';

export default function Categories({ onSelectCategory }: { onSelectCategory: (category: string) => void }) {
  return (
    <section id="categorías" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-12">
        <div>
          <h2 className="text-4xl font-display font-black uppercase tracking-tight mb-2">
            NUESTRAS <span className="text-primary italic">CATEGORÍAS</span>
          </h2>
          <p className="text-gray-400">Todo lo que necesitás para tu hogar en un solo lugar.</p>
        </div>
        <button 
          onClick={() => onSelectCategory('')}
          className="text-sm font-bold border-b-2 border-primary pb-1 hover:text-primary transition-colors uppercase tracking-widest hidden sm:block"
        >
          Ver todas
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {categories.map((category, index) => {
          const Icon = (Icons as any)[category.icon];
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              onClick={() => onSelectCategory(category.name)}
              className="glass p-6 rounded-xl flex flex-col items-center justify-center gap-4 group cursor-pointer hover:bg-white/10 transition-all duration-300 border border-white/5 active:scale-95"
            >
              <div className="text-gray-400 group-hover:text-primary transition-colors">
                {Icon && <Icon size={32} />}
              </div>
              <span className="font-bold text-xs uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">
                {category.name}
              </span>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
