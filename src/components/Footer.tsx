import { Instagram, Facebook, Phone, MapPin, Mail, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-secondary pt-24 pb-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
        <div className="space-y-6">
          <Logo showYears={false} />
          <p className="text-gray-400 leading-relaxed text-sm">
            Desde 1985 ofreciendo la mayor variedad y calidad en productos para tu hogar en Paraná. Tu bazar de confianza.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-primary hover:text-black transition-all">
              <Instagram size={20} />
            </a>
            <a href="#" className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-primary hover:text-black transition-all">
              <Facebook size={20} />
            </a>
            <a href="#" className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-primary hover:text-black transition-all">
              <Phone size={20} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-display font-bold uppercase tracking-widest mb-8 text-sm text-primary">Navegación</h4>
          <ul className="space-y-4 text-gray-400 text-sm font-semibold uppercase tracking-wider text-[11px]">
            <li><Link to="/" className="hover:text-white transition-colors">Inicio</Link></li>
            <li><Link to="/productos" className="hover:text-white transition-colors">Productos</Link></li>
            <li><Link to="/ofertas" className="hover:text-white transition-colors">Ofertas</Link></li>
            <li><Link to="/nosotros" className="hover:text-white transition-colors">Nosotros</Link></li>
            <li><Link to="/pagos" className="hover:text-white transition-colors">Pagos/Seguimiento</Link></li>
            <li><Link to="/admin" className="hover:text-white text-primary/80 transition-colors capitalize font-medium flex items-center gap-1.5 pt-2 border-t border-white/5 mt-2">⚙️ Panel Admin</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold uppercase tracking-widest mb-8 text-sm text-primary">Contacto</h4>
          <ul className="space-y-5 text-gray-400 text-sm">
            <li className="flex gap-4">
              <MapPin size={20} className="text-primary shrink-0" />
              <span>Alem 110 esquina Gualeguaychú, Paraná, Entre Ríos.</span>
            </li>
            <li className="flex gap-4">
              <Phone size={20} className="text-primary shrink-0" />
              <span>+54 343 431-7870</span>
            </li>
            <li className="flex gap-4">
              <Mail size={20} className="text-primary shrink-0" />
              <span>ventas@bazaryes.com</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold uppercase tracking-widest mb-8 text-sm text-primary">Newsletter</h4>
          <p className="text-gray-400 text-sm mb-6">Recibí ofertas exclusivas y novedades de nuevos ingresos.</p>
          <div className="relative">
            <input 
              type="email" 
              placeholder="Tu email"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 pr-12 focus:outline-none focus:border-primary transition-colors text-sm"
            />
            <button className="absolute right-2 top-2 w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-black hover:scale-110 transition-transform">
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-[11px] text-gray-500 uppercase font-bold tracking-[0.2em]">
        <p>© 2024 BAZAR YES PARANA - TODOS LOS DERECHOS RESERVADOS</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-white transition-colors">Términos y Condiciones</a>
          <a href="#" className="hover:text-white transition-colors">Privacidad</a>
        </div>
      </div>
    </footer>
  );
}
