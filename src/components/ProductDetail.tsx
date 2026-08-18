import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingCart, Truck, ShieldCheck, Star, Bell, CheckCircle2, Loader2, Sparkles, CreditCard } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../lib/utils';
import { useCart } from '../context/CartContext';
import { useFirebase } from '../context/FirebaseContext';
import { addStockNotification } from '../services/dataService';
import { ProductImage } from './ProductImage';
import toast from 'react-hot-toast';

interface ProductDetailProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductDetail({ product, onClose }: ProductDetailProps) {
  const { addToCart } = useCart();
  const { db } = useFirebase();
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [contactInfo, setContactInfo] = useState('');
  const [contactType, setContactType] = useState<'whatsapp' | 'email'>('whatsapp');
  const [isSubmittingNotif, setIsSubmittingNotif] = useState(false);
  const [notifSet, setNotifSet] = useState(false);

  if (!product) return null;

  const hasValidDiscount = typeof product.discountPrice === 'number' && 
    product.discountPrice > 0 && 
    product.discountPrice < product.price;

  const currentImage = (product.images && product.images[selectedImgIndex]) || (product.images && product.images[0]) || '';

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactInfo.trim()) return;
    setIsSubmittingNotif(true);
    try {
      await addStockNotification(db, {
        productId: product.id,
        productName: product.name,
        contact: contactInfo.trim(),
        contactType: contactType,
      });
      setNotifSet(true);
      toast.success('¡Alerta de stock activada con éxito!', { icon: '🔔' });
    } catch (err) {
      console.error(err);
      toast.error('Ocurrió un error al registrar la alerta.');
    } finally {
      setIsSubmittingNotif(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-surface w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 shadow-2xl shadow-primary/10"
        >
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-white"
          >
            <X size={20} />
          </button>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12 p-6 md:p-12">
            {/* Image Section */}
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl overflow-hidden glass border border-white/10 bg-black/40">
                <ProductImage 
                  src={currentImage} 
                  className="w-full h-full object-cover" 
                  alt={product.name} 
                  category={product.category}
                />
              </div>
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.map((img, i) => (
                    <button
                      key={i} 
                      type="button"
                      onClick={() => setSelectedImgIndex(i)}
                      className={`aspect-square rounded-xl overflow-hidden glass border transition-all ${selectedImgIndex === i ? 'border-primary scale-105 opacity-100 ring-2 ring-primary/30' : 'border-white/10 opacity-60 hover:opacity-100'}`}
                    >
                      <ProductImage src={img} className="w-full h-full object-cover" alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20">{product.category}</span>
                  <div className="flex gap-0.5 text-accent">
                    {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                  </div>
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-black uppercase tracking-tight text-white mb-3">{product.name}</h2>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl md:text-4xl font-display font-black text-primary font-mono">
                    {formatCurrency(hasValidDiscount ? product.discountPrice! : product.price)}
                  </span>
                  {hasValidDiscount && (
                    <span className="text-base text-gray-500 line-through font-mono">
                      {formatCurrency(product.price)}
                    </span>
                  )}
                </div>
                {product.installments && (
                   <p className="text-emerald-400 font-bold font-mono text-xs mt-2 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg w-fit">
                     <CreditCard size={13} />
                     Hasta {product.installments} cuotas sin interés
                   </p>
                )}
              </div>

              <div className="space-y-4">
                <p className="text-gray-400 text-sm leading-relaxed">
                  {product.description}
                </p>
                <div className="grid grid-cols-2 gap-y-2 text-[11px] uppercase font-bold text-gray-500 tracking-widest pt-4 border-t border-white/5">
                   <div>Disponibilidad: <span className="text-white">{product.stock} Unidades</span></div>
                   <div>SKU: <span className="text-white">BY-{product.id.padStart(5, '0')}</span></div>
                </div>
              </div>

              <div className="space-y-4">
                {product.stock > 0 ? (
                  <button 
                    onClick={() => {
                      addToCart(product);
                      onClose();
                    }}
                    className="w-full primary-gradient text-white h-14 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-lg shadow-primary/20"
                  >
                    <ShoppingCart size={20} />
                    Agregar al Carrito
                  </button>
                ) : (
                  <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-yellow-400">
                        <Bell size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Agotado Temporalmente</h4>
                        <p className="text-[11px] text-gray-400">¿Te interesa este diseño? Avisanos y te notificamos ni bien reingrese stock en Paraná.</p>
                      </div>
                    </div>

                    {notifSet ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-emerald-400 text-xs font-bold"
                      >
                        <CheckCircle2 size={16} />
                        <span>¡Anotado! Te avisaremos al instante de reponer.</span>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleRestockSubmit} className="space-y-2.5">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setContactType('whatsapp')}
                            className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-colors ${contactType === 'whatsapp' ? 'bg-primary/10 border-primary text-primary' : 'bg-transparent border-white/5 text-gray-400 hover:text-white'}`}
                          >
                            WhatsApp
                          </button>
                          <button
                            type="button"
                            onClick={() => setContactType('email')}
                            className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-colors ${contactType === 'email' ? 'bg-primary/10 border-primary text-primary' : 'bg-transparent border-white/5 text-gray-400 hover:text-white'}`}
                          >
                            Email
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type={contactType === 'email' ? 'email' : 'tel'}
                            required
                            disabled={isSubmittingNotif}
                            value={contactInfo}
                            onChange={(e) => setContactInfo(e.target.value)}
                            placeholder={contactType === 'email' ? 'ejemplo@correo.com' : 'Ej: 343456789'}
                            className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 text-xs font-medium text-white focus:outline-none focus:border-primary disabled:opacity-50"
                          />
                          <button
                            type="submit"
                            disabled={isSubmittingNotif || !contactInfo.trim()}
                            className="bg-white text-black hover:bg-primary font-black uppercase text-[10px] tracking-widest px-5 h-11 rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                          >
                            {isSubmittingNotif ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <span>Activar</span>
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">
                   <div className="flex items-center gap-2"><Truck size={14} className="text-primary" /> Envío Gratis Paraná</div>
                   <div className="flex items-center gap-2"><ShieldCheck size={14} className="text-accent" /> Compra Protegida</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
