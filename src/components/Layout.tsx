import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import ProductDetail from './ProductDetail';
import WhatsAppButton from './WhatsAppButton';
import { useCart } from '../context/CartContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  const { isCartOpen, setIsCartOpen, selectedProduct, setSelectedProduct } = useCart();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowTopBtn(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const search = searchParams.get('search') || '';

  const handleSearchChange = (val: string) => {
    if (val.trim()) {
      navigate(`/productos?search=${encodeURIComponent(val)}`);
    } else {
      navigate('/productos');
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-background text-white selection:bg-primary selection:text-black">
      <Navbar 
        onOpenCart={() => setIsCartOpen(true)} 
        searchTerm={search}
        onSearchChange={handleSearchChange}
      />
      
      <main className="flex-grow pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      
      <Footer />

      {/* Floating Buttons */}
      <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-4">
        {showTopBtn && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-14 h-14 glass rounded-full flex items-center justify-center text-primary shadow-2xl hover:bg-white/10 transition-colors border border-white/5"
            title="Volver arriba"
          >
            <ArrowUp size={24} />
          </motion.button>
        )}
        <WhatsAppButton />
      </div>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      {selectedProduct && <ProductDetail product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </div>
  );
}
