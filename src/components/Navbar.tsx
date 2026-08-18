import { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, Search, User, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { cn } from '../lib/utils';

interface NavbarProps {
  onOpenCart: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
}

import Logo from './Logo';

export default function Navbar({ onOpenCart, searchTerm, onSearchChange }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchInputVisible, setIsSearchInputVisible] = useState(false);
  const { totalItems } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
      isScrolled ? "bg-background/80 backdrop-blur-lg border-b border-white/5 py-3" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="hover:opacity-90 transition-opacity">
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/productos" className="hover:text-primary transition-colors tracking-widest uppercase text-[10px] font-black">Productos</Link>
          <Link to="/ofertas" className="hover:text-primary transition-colors tracking-widest uppercase text-[10px] font-black">Ofertas</Link>
          <Link to="/nosotros" className="hover:text-primary transition-colors tracking-widest uppercase text-[10px] font-black">Nosotros</Link>
          <Link to="/pagos" className="hover:text-primary transition-colors tracking-widest uppercase text-[10px] font-black">Pagos</Link>
          <Link to="/admin" className="hover:text-primary transition-colors tracking-widest uppercase text-[10px] font-black flex items-center gap-1 border border-white/10 px-3 py-1 rounded-full bg-white/5">
            <User size={12} />
            Admin
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <AnimatePresence>
              {isSearchInputVisible && (
                <motion.div 
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 180, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="relative flex items-center overflow-hidden"
                >
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-full px-4 pr-8 py-1.5 text-xs focus:outline-none focus:border-primary text-white font-medium w-full"
                    autoFocus
                  />
                  {searchTerm && (
                    <button 
                      type="button"
                      onClick={() => onSearchChange('')}
                      className="absolute right-2.5 hover:text-primary text-gray-400 p-0.5 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <button 
              onClick={() => {
                setIsSearchInputVisible(!isSearchInputVisible);
                if (isSearchInputVisible) onSearchChange('');
              }} 
              className={cn("hover:text-primary transition-colors", isSearchInputVisible && "text-primary")}
              title="Buscar productos"
            >
              <Search size={22} />
            </button>
          </div>
          <button className="hover:text-primary transition-colors hidden sm:block">
            <Heart size={22} />
          </button>
          <button 
            onClick={onOpenCart}
            className="hover:text-primary transition-colors flex items-center relative"
          >
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden">
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 glass border-t border-white/5 p-6 md:hidden"
          >
            <div className="flex flex-col gap-6">
              {/* Search input in mobile view */}
              <div className="relative flex items-center w-full">
                <Search className="absolute left-3.5 text-gray-500" size={16} />
                <input
                  type="text"
                  placeholder="Buscar productos en Bazar..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-full pl-10 pr-9 py-2.5 text-xs focus:outline-none focus:border-primary text-white font-medium w-full"
                />
                {searchTerm && (
                  <button 
                    type="button"
                    onClick={() => onSearchChange('')}
                    className="absolute right-3 hover:text-primary text-gray-400 p-1"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-6 font-medium uppercase text-sm">
                <Link to="/productos" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary transition-colors">Productos</Link>
                <Link to="/ofertas" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary transition-colors">Ofertas</Link>
                <Link to="/nosotros" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary transition-colors">Nosotros</Link>
                <Link to="/pagos" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary transition-colors">Pagos</Link>
                <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary/90 text-primary transition-colors flex items-center gap-2 pt-4 border-t border-white/5 tracking-widest text-xs font-black">
                  <User size={14} />
                  Panel Admin
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
