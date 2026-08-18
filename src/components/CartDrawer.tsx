import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft, Copy, CheckCircle2, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../lib/utils';
import { useFirebase } from '../context/FirebaseContext';
import { createOrder, getCouponsFromDb } from '../services/dataService';
import { Coupon } from '../types';
import { ProductImage } from './ProductImage';
import toast from 'react-hot-toast';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeFromCart, updateQuantity, totalAmount, totalItems, clearCart } = useCart();
  const { db } = useFirebase();
  
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'contact' | 'success'>('cart');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [createdOrderId, setCreatedOrderId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OPTION 1: Coupons System states
  const [couponsList, setCouponsList] = useState<Coupon[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  // Fetch available active coupons inside Paraná database on open
  useEffect(() => {
    if (isOpen) {
      getCouponsFromDb(db)
        .then((list) => {
          setCouponsList(list.filter(c => c.isActive));
        })
        .catch(console.error);
    }
  }, [db, isOpen]);

  const getDiscountAmount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.minPurchase && totalAmount < appliedCoupon.minPurchase) return 0;
    
    if (appliedCoupon.discountType === 'percentage') {
      return Math.round((totalAmount * appliedCoupon.discountValue) / 100);
    } else {
      return appliedCoupon.discountValue;
    }
  };

  const couponDiscount = getDiscountAmount();
  const finalTotal = Math.max(0, totalAmount - couponDiscount);

  const handleApplyCouponCode = (code: string) => {
    setCouponError('');
    const found = couponsList.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
    if (!found) {
      setCouponError('Cupón inválido o vencido');
      toast.error('Cupón inválido o vencido');
      return;
    }
    
    if (found.minPurchase && totalAmount < found.minPurchase) {
      setCouponError(`Compra mínima requerida: ${formatCurrency(found.minPurchase)}`);
      toast.error(`Mínimo requerido: ${formatCurrency(found.minPurchase)}`);
      return;
    }

    setAppliedCoupon(found);
    setCouponInput('');
    toast.success(`Cupón aplicado: ${found.code}`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.success('Cupón removido');
  };

  const handleClose = () => {
    setCheckoutStep('cart');
    onClose();
  };

  const handleCheckoutSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Save order using high fidelity service to both Firestore (if available) and Local Storage
      const orderId = await createOrder(db, {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || 'sin_email@bazar-yes.com',
        customerPhone: customerPhone.trim(),
        items: [...items],
        total: finalTotal,
        status: 'pending',
        paymentMethod: 'WhatsApp Directo',
        ...(appliedCoupon ? {
          couponApplied: {
            code: appliedCoupon.code,
            discountAmount: couponDiscount,
            discountType: appliedCoupon.discountType,
            discountValue: appliedCoupon.discountValue
          }
        } : {})
      });
      setCreatedOrderId(orderId);
      setCheckoutStep('success');
    } catch (e) {
      console.error('Error auto-registering order', e);
      toast.error('Ocurrió un error al procesar el pedido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-secondary z-[70] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {checkoutStep === 'contact' ? (
                  <button onClick={() => setCheckoutStep('cart')} className="hover:text-primary transition-colors mr-2">
                    <ArrowLeft size={20} />
                  </button>
                ) : checkoutStep === 'success' ? (
                  <CheckCircle2 size={24} className="text-primary animate-pulse" />
                ) : (
                  <ShoppingBag size={24} className="text-primary" />
                )}
                <h2 className="text-xl font-display font-black uppercase tracking-tight">
                  {checkoutStep === 'contact' ? 'Datos de Contacto' : checkoutStep === 'success' ? 'Pedido Registrado' : 'Tu Carrito'}
                </h2>
                {checkoutStep === 'cart' && (
                  <span className="text-xs bg-primary text-black font-bold px-2 py-0.5 rounded-full">
                    {totalItems}
                  </span>
                )}
              </div>
              <button onClick={handleClose} className="hover:text-primary transition-colors">
                <X size={28} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 && checkoutStep !== 'success' ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag size={40} className="text-gray-600" />
                  </div>
                  <p className="text-gray-400 font-medium mb-8">Tu carrito está vacío</p>
                  <button 
                    onClick={handleClose}
                    className="primary-gradient text-black px-8 py-3 rounded-full font-bold uppercase text-sm"
                  >
                    Empezar a comprar
                  </button>
                </div>
              ) : checkoutStep === 'success' ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-4">
                  <div className="w-16 h-16 bg-primary/10 border border-primary/20 text-primary rounded-full flex items-center justify-center animate-bounce">
                    <CheckCircle2 size={36} />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-display font-black uppercase text-lg text-white">¡Pedido Registrado con Éxito!</h3>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                      Tu pedido se ha guardado localmente y sincronizado en Paraná.
                    </p>
                  </div>

                  {/* Order ID display box with Copy */}
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl w-full space-y-2 text-left">
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest font-black block">ID para Carga de Comprobante</span>
                    <div className="flex items-center justify-between bg-black/40 px-3 py-2.5 text-primary font-mono text-xs rounded-xl border border-white/5">
                      <span className="select-all font-bold font-mono">{createdOrderId}</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(createdOrderId);
                          toast.success('¡ID Copiado! Podés usarlo abajo en el seguimiento de la web');
                        }}
                        className="text-gray-400 hover:text-white transition-colors p-1"
                        title="Copiar ID"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-400 uppercase leading-relaxed font-bold">
                    Anotá este código. Podrás ingresarlo abajo en la pantalla principal en <strong>"Seguimiento de Pedidos"</strong> para adjuntar el comprobante de transferencia y ver la preparación de tu pedido.
                  </p>

                  <button 
                    onClick={() => {
                      const whatsappNumber = typeof window !== 'undefined' ? (localStorage.getItem('bazar_yes_whatsapp') || '5493435033268') : '5493435033268';
                      const couponText = appliedCoupon ? `\n• Cupón de Descuento [${appliedCoupon.code}]: -${formatCurrency(couponDiscount)}` : '';
                      const message = `Hola Bazar YES! 👋 Quería coordinar por mi pedido con ID *${createdOrderId}* por un valor final de *${formatCurrency(finalTotal)}*${couponText}.\n\nMis Datos:\n• Nombre: ${customerName}\n• Teléfono: ${customerPhone}`;
                      
                      setAppliedCoupon(null);
                      clearCart();
                      handleClose();
                      setCheckoutStep('cart');
                      setCreatedOrderId('');
                      
                      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
                    }}
                    className="w-full primary-gradient text-white h-14 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20"
                  >
                    <span>Coordinar en WhatsApp</span>
                    <ArrowRight size={20} />
                  </button>
                </div>
              ) : checkoutStep === 'cart' ? (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="w-20 h-20 rounded-xl overflow-hidden glass shrink-0 bg-black/40 border border-white/5">
                      <ProductImage 
                        src={item.images && item.images.length > 0 ? item.images[0] : undefined} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-sm group-hover:text-primary transition-colors">
                            {item.name}
                          </h3>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-500 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-primary font-display font-bold">
                          {formatCurrency(item.discountPrice || item.price)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 bg-white/5 rounded-lg px-2 py-1">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="hover:text-primary transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="hover:text-primary transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="text-xs font-bold text-gray-500">
                          Total: {formatCurrency((item.discountPrice || item.price) * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                    Por favor completá tus datos para registrar el pedido y continuar a WhatsApp
                  </p>
                  
                  <div>
                    <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
                      Nombre Completo *
                    </label>
                    <input 
                      type="text" 
                      required 
                      disabled={isSubmitting}
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ej: Juan Pérez"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none transition-colors disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
                      Número de WhatsApp *
                    </label>
                    <input 
                      type="tel" 
                      required 
                      disabled={isSubmitting}
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Ej: 3434567890"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none transition-colors disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
                      Email (Opcional)
                    </label>
                    <input 
                      type="email" 
                      disabled={isSubmitting}
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="Ej: juan@gmail.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none transition-colors disabled:opacity-50"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full primary-gradient text-white h-14 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20 mt-6 disabled:opacity-75 disabled:hover:scale-100"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={20} className="animate-spin text-white" />
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                        <span>Completar y Ver ID</span>
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {items.length > 0 && checkoutStep === 'cart' && (
              <div className="p-6 glass border-t border-white/10 space-y-4">
                {/* Coupon Block */}
                <div className="space-y-2 border-b border-white/5 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                      🎟️ ¿Tenés un cupón?
                    </span>
                    {appliedCoupon && (
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-[9px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wider"
                      >
                        Quitar [x]
                      </button>
                    )}
                  </div>

                  {appliedCoupon ? (
                     <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 flex items-center justify-between text-emerald-400">
                       <div className="text-left">
                         <span className="font-mono font-black uppercase bg-emerald-500/25 px-2 py-0.5 rounded text-[10px] mr-1.5">{appliedCoupon.code}</span>
                         <span className="text-[10px] font-medium text-gray-300 block mt-1">{appliedCoupon.description}</span>
                       </div>
                       <span className="font-mono font-black text-xs shrink-0">-{formatCurrency(couponDiscount)}</span>
                     </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value);
                          setCouponError('');
                        }}
                        placeholder="Ingresá código"
                        className="flex-1 bg-black/45 border border-white/5 rounded-xl px-3 py-2 text-xs uppercase font-mono tracking-wider focus:outline-none focus:border-primary placeholder:capitalize placeholder:font-sans placeholder:tracking-normal text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyCouponCode(couponInput)}
                        className="px-3 bg-white/5 hover:bg-primary border border-white/10 hover:border-primary text-gray-300 hover:text-black font-black uppercase text-[9px] tracking-widest rounded-xl transition-all"
                      >
                        Aplicar
                      </button>
                    </div>
                  )}
                  {couponError && (
                    <p className="text-[10px] text-red-400 font-semibold">{couponError}</p>
                  )}

                  {/* Hot discoverable deals tags list */}
                  {!appliedCoupon && couponsList.length > 0 && (
                    <div className="pt-1.5 flex flex-wrap gap-1.5 align-middle">
                      {couponsList.map(c => {
                        const isDisabled = c.minPurchase && totalAmount < c.minPurchase;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => handleApplyCouponCode(c.code)}
                            className={`text-[9px] font-mono font-black px-2 py-0.5 rounded border transition-all ${isDisabled ? 'opacity-35 bg-black/20 border-white/5 text-gray-500 cursor-not-allowed' : 'bg-primary/5 hover:bg-primary border-primary/20 hover:border-primary text-primary hover:text-black active:scale-95'}`}
                            title={c.description}
                          >
                            % {c.code}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  {appliedCoupon && (
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Subtotal</span>
                      <span className="font-mono">{formatCurrency(totalAmount)}</span>
                    </div>
                  )}
                  {appliedCoupon && (
                    <div className="flex items-center justify-between text-xs text-emerald-400">
                      <span>Descuento</span>
                      <span className="font-mono">-{formatCurrency(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-gray-400 font-medium">Total</span>
                    <span className="text-xl font-display font-black text-white font-mono tracking-tight">
                      {formatCurrency(finalTotal)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={() => setCheckoutStep('contact')}
                    className="w-full primary-gradient text-white h-14 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20"
                  >
                    <span>Completar Pedido</span>
                    <ArrowRight size={20} />
                  </button>
                  <button 
                    onClick={() => {
                      handleClose();
                      window.location.href = '#pagos';
                    }}
                    className="w-full bg-white/5 text-gray-400 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
                  >
                    Ver Medios de Pago
                  </button>
                  <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest font-bold">
                    Envío gratis en Paraná superando los $30.000
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
