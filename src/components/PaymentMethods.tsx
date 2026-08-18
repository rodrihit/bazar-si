import { motion } from 'motion/react';
import { CreditCard, Smartphone, Banknote, ShieldCheck, Upload, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function PaymentMethods() {
  const [isUploaded, setIsUploaded] = useState(false);

  const methods = [
    { name: 'Mercado Pago', desc: 'Transferencia o QR', color: 'bg-[#009EE3]', icon: Smartphone },
    { name: 'Tarjetas YES', desc: 'Hasta 12 cuotas sin interés', color: 'bg-primary', icon: CreditCard },
    { name: 'Transferencia', desc: 'Descuento extra del 10%', color: 'bg-accent', icon: ShieldCheck },
    { name: 'Efectivo', desc: 'Pago en local Paraná', color: 'bg-green-600', icon: Banknote }
  ];

  return (
    <section id="pagos" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-20">
          <div className="badge mx-auto">Medios de Pago</div>
          <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tight text-white">
            PAGÁ COMO <span className="text-primary italic">VOS QUIERAS</span>
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto uppercase text-[10px] font-black tracking-widest leading-loose">
            Aceptamos todos los medios. Aprovechá nuestras promos bancarias y planes de financiación.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          {methods.map((method, idx) => (
            <motion.div 
              key={method.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="glass p-8 rounded-2xl border border-white/5 hover:border-primary/30 transition-all group"
            >
              <div className={`w-14 h-14 ${method.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                <method.icon size={28} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">{method.name}</h3>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{method.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Payment Proof Simulator */}
        <div className="glass max-w-2xl mx-auto rounded-3xl p-8 md:p-12 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="flex-1 space-y-4 text-center md:text-left">
              <h3 className="text-2xl font-display font-black uppercase tracking-tight text-white">¿YA REALIZASTE <br />EL PAGO?</h3>
              <p className="text-sm text-gray-400">Subí tu comprobante para agilizar el despacho de tu pedido.</p>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                 <div className="text-[10px] bg-white/5 px-3 py-1 rounded-full text-gray-400 font-bold uppercase">CBU: 0110407720040770542312</div>
                 <div className="text-[10px] bg-white/5 px-3 py-1 rounded-full text-gray-400 font-bold uppercase">Alias: BAZAR.YES</div>
              </div>
            </div>

            <div className="w-full md:w-64">
              {!isUploaded ? (
                <label className="border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 transition-all bg-white/[0.02]">
                  <input type="file" className="hidden" onChange={() => setIsUploaded(true)} />
                  <Upload className="text-primary" size={32} />
                  <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Subir Ticket</span>
                </label>
              ) : (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 flex flex-col items-center justify-center gap-3"
                >
                  <CheckCircle2 className="text-green-500" size={32} />
                  <span className="text-[10px] font-black uppercase text-green-500 tracking-widest">Recibido</span>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
