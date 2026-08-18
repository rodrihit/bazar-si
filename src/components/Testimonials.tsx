import { motion } from 'motion/react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "María Garcia",
    role: "Cliente Paraná",
    content: "Excelente atención y variedad. Compré todo el set de ollas y son de una calidad increíble. El envío llegó en el día.",
    stars: 5
  },
  {
    name: "Juan Pérez",
    role: "Chef Profesional",
    content: "Como profesional busco durabilidad. El Bazar YES siempre tiene lo que necesito con precios muy competitivos.",
    stars: 5
  },
  {
    name: "Sofía Luna",
    role: "Diseñadora de Interiores",
    content: "La sección de decoración es perfecta. Detalles únicos que no se ven en otros lugares de la ciudad.",
    stars: 4
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-display font-black uppercase tracking-tight mb-4">
          QUÉ DICEN <span className="text-primary italic">NUESTROS CLIENTES</span>
        </h2>
        <div className="h-1 w-24 bg-primary mx-auto rounded-full" />
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass p-8 rounded-3xl relative"
          >
            <Quote className="absolute top-6 right-8 text-white/5" size={64} />
            <div className="flex gap-1 text-primary mb-6">
              {[...Array(t.stars)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
            </div>
            <p className="text-gray-300 italic mb-8 leading-relaxed">"{t.content}"</p>
            <div>
              <h4 className="font-bold">{t.name}</h4>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">{t.role}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
