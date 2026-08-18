import { motion } from 'motion/react';
import { ShieldCheck, Truck, CreditCard, Award, Car, MapPin, Clock } from 'lucide-react';

export default function AboutUs() {
  return (
    <section id="nosotros" className="py-24 px-6 bg-surface/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="badge w-fit">Nuestra Historia</div>
            <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tight leading-[0.95] text-white">
              35 AÑOS CREANDO <br />
              <span className="text-primary italic">HOGARES FELICES</span>
            </h2>
            <div className="space-y-4 text-gray-400 leading-relaxed">
              <p>
                Desde 1985, Bazar YES es el punto de encuentro para quienes buscan transformar su casa en un hogar. Ubicados en el corazón de Paraná, Entre Ríos, nos hemos consolidado como referentes en bazar, regalería y electrodomésticos.
              </p>
              <p>
                Nuestra misión es simple: ofrecer la mayor variedad de productos con la calidad que tu familia merece y la calidez de una atención personalizada que solo un negocio local puede brindar.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4">
              {[
                { icon: ShieldCheck, label: 'Garantía YES', desc: 'Productos seleccionados' },
                { icon: Award, label: 'Líder local', desc: 'Desde 1985 en Paraná' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm uppercase tracking-tight">{item.label}</div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-3xl overflow-hidden glass border border-white/5 relative z-10">
              <img 
                src="https://images.unsplash.com/photo-1556911220-e15024bb8b47?auto=format&fit=crop&q=80&w=1200" 
                className="w-full h-full object-cover grayscale-[0.2]"
                alt="Bazar Interior"
                referrerPolicy="no-referrer"
              />
            </div>
            
            {/* Float Badge */}
            <div className="absolute -bottom-6 -right-6 glass p-8 rounded-2xl z-20 border border-primary/20 shadow-2xl shadow-primary/10">
              <div className="text-5xl font-display font-black text-primary leading-none">35</div>
              <div className="text-xs font-bold text-white uppercase tracking-widest mt-1">Años de Confianza</div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
          </motion.div>
        </div>

        {/* Estacionamientos Cercanos Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 pt-16 border-t border-white/5 space-y-10"
        >
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="badge mx-auto flex gap-1.5 items-center justify-center">
              <Car size={12} className="text-primary animate-pulse" />
              <span>Zona Céntrica Paraná</span>
            </div>
            <h3 className="text-3xl font-display font-black uppercase tracking-tight text-white mb-2">
              ¿VENÍS EN AUTO? <span className="text-primary italic">ESTACIONÁ SIN COMPLICACIONES</span>
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed max-w-xl mx-auto">
              Sabemos que estacionar en el centro de Paraná puede ser un desafío. Por eso, seleccionamos las mejores alternativas y playas privadas a solo pasos de nuestro local en <strong className="text-white">Alem 110 (esquina Gualeguaychú)</strong> para que realices tus compras con total comodidad.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Cochera & Estacionamiento "Alem"',
                address: 'Calle Alem 235',
                distance: 'A solo 120 metros de nuestra tienda',
                time: '1 min. caminando',
                benefit: 'Recomendada para carga de compras de gran volumen, vajilla y bultos grandes.'
              },
              {
                name: 'Estacionamiento "Gualeguaychú"',
                address: 'Av. Gualeguaychú 120',
                distance: 'A solo 95 metros (a la vuelta)',
                time: '1 min. caminando',
                benefit: 'Excelente opción ágil para visitas rápidas y compras o retiros exprés.'
              },
              {
                name: 'Cochera Privada "Belgrano"',
                address: 'Calle Belgrano 160',
                distance: 'A 180 metros de la esquina',
                time: '2 min. caminando',
                benefit: 'Gran disponibilidad, bajo techo y de fácil maniobra para estadías más prolongadas.'
              }
            ].map((garage, idx) => (
              <div 
                key={idx} 
                className="glass p-6 rounded-2xl border border-white/5 hover:border-primary/20 hover:bg-white/[0.01] transition-all group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 group-hover:bg-primary group-hover:text-black transition-colors">
                      <Car size={18} />
                    </div>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-white/5 text-gray-400 px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-white/5">
                      <Clock size={10} className="text-primary" />
                      {garage.time}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="font-display font-black text-sm uppercase text-white tracking-wide group-hover:text-primary transition-colors">
                      {garage.name}
                    </h4>
                    <span className="text-[10px] text-gray-400 font-bold block flex items-center gap-1">
                      <MapPin size={10} className="text-primary shrink-0" />
                      {garage.address}
                    </span>
                    <span className="text-[9px] text-gray-500 font-bold block">
                      {garage.distance}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed font-normal">
                    {garage.benefit}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 text-[9px] uppercase tracking-wider font-extrabold text-primary flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                  Playa Privada Segura
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-stretch mt-12">
            <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
              <div className="glass p-6 rounded-2xl border border-white/5 bg-primary/[0.02] flex items-start gap-4 shadow-xl h-full">
                <div className="p-2.5 rounded-xl bg-primary/15 text-primary shrink-0 mt-0.5 border border-primary/20">
                  <Car size={16} />
                </div>
                <div className="space-y-2">
                  <strong className="text-xs text-white uppercase tracking-wider block font-black">💡 TIP PARA COMPRAS VOLUMINOSAS</strong>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Si realizás una compra de gran volumen o peso, no te preocupes: podés detenerte un instante con balizas encendidas frente al local para que carguemos los bultos directamente en tu vehículo. ¡Nuestro equipo te ayuda con gusto!
                  </p>
                </div>
              </div>

              <div className="glass p-6 rounded-2xl border border-white/5 space-y-4 h-full flex flex-col justify-between">
                <div>
                  <h4 className="font-display font-black text-xs uppercase text-white tracking-widest flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Guía de Orientación
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Bazar YES está estratégicamente situado en la esquina clásica de <strong>Alem y Gualeguaychú, Paraná</strong>. Los tres estacionamientos recomendados se encuentran a menos de 100/180 metros a la redonda (un minuto y medio a pie).
                  </p>
                </div>
                <div className="pt-2">
                  <a 
                    href="https://maps.google.com/?q=Alem+110,+Parana,+Entre+Rios" 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-black uppercase text-primary hover:underline hover:text-white transition-colors"
                  >
                    <MapPin size={14} className="animate-pulse" />
                    Abrir Ruta en Google Maps
                  </a>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 min-h-[350px] rounded-3xl overflow-hidden glass border-4 border-white/5 relative shadow-2xl">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3393.123547349!2d-60.5284!3d-31.7331!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95b4528!2sAlem%20110%2C%20Paran%C3%A1%2C%20Entre%20R%C3%ADos!5e0!3m2!1ses!2sar!4v1620000000000!5m2!1ses!2sar"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(0.8) contrast(1.2)' }}
                allowFullScreen={false}
                loading="lazy"
                title="Bazar YES Estacionamiento Paraná"
              ></iframe>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
