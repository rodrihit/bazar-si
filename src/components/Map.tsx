import * as Icons from 'lucide-react';

export default function GoogleMap() {
  return (
    <section id="contacto" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-4xl font-display font-black uppercase tracking-tight mb-6">
            DÓNDE <span className="text-primary italic">ESTAMOS</span>
          </h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Te esperamos en nuestra sucursal central en Paraná para que veas todos nuestros productos en persona.
          </p>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 glass rounded-xl flex items-center justify-center text-primary shrink-0">
                <Icons.MapPin size={24} />
              </div>
              <div>
                <h4 className="font-bold uppercase text-xs tracking-widest text-gray-500 mb-1">Dirección</h4>
                <p className="font-bold">Alem 110 esquina Gualeguaychú, Paraná.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 glass rounded-xl flex items-center justify-center text-primary shrink-0">
                <Icons.Clock size={24} />
              </div>
              <div>
                <h4 className="font-bold uppercase text-xs tracking-widest text-gray-500 mb-1">Horarios</h4>
                <p className="font-bold">Lunes a Viernes: 08:00 - 12:00 / 16:00 - 20:00</p>
                <p className="font-bold">Sábados: 08:00 - 12:30 / 17:00 - 20:00</p>
              </div>
            </div>
          </div>
        </div>
        <div className="h-[400px] rounded-3xl overflow-hidden glass border-4 border-white/5 shadow-2xl">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3393.123547349!2d-60.5284!3d-31.7331!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95b4528!2sAlem%20110%2C%20Paran%C3%A1%2C%20Entre%20R%C3%ADos!5e0!3m2!1ses!2sar!4v1620000000000!5m2!1ses!2sar"
            width="100%"
            height="100%"
            style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(0.8) contrast(1.2)' }}
            allowFullScreen={false}
            loading="lazy"
            title="Google Maps Paraná"
          ></iframe>
        </div>
      </div>
    </section>
  );
}
