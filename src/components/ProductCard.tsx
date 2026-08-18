import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Eye, Heart, CreditCard, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../lib/utils';
import { useCart } from '../context/CartContext';
import { ProductImage } from './ProductImage';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  index: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index }) => {
  const { addToCart, setSelectedProduct } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Real percentage discount calculation
  const hasValidDiscount = typeof product.discountPrice === 'number' && 
    product.discountPrice > 0 && 
    product.discountPrice < product.price;

  const discountPercentage = hasValidDiscount 
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100) 
    : 0;

  // Local storage wishlist sync
  useEffect(() => {
    try {
      const wishlist = JSON.parse(localStorage.getItem('bazar_yes_wishlist') || '[]');
      setIsFavorite(wishlist.includes(product.id));
    } catch {
      // Ignore fallback
    }
  }, [product.id]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const wishlist = JSON.parse(localStorage.getItem('bazar_yes_wishlist') || '[]');
      let updatedWishlist = [];
      if (isFavorite) {
        updatedWishlist = wishlist.filter((id: string) => id !== product.id);
        toast.success(`Quitado de favoritos: ${product.name}`, { icon: '🤍' });
      } else {
        updatedWishlist = [...wishlist, product.id];
        toast.success(`Añadido a favoritos: ${product.name}`, { icon: '❤️' });
      }
      localStorage.setItem('bazar_yes_wishlist', JSON.stringify(updatedWishlist));
      setIsFavorite(!isFavorite);
    } catch {
      setIsFavorite(!isFavorite);
    }
  };

  const getStockBadge = () => {
    if (product.stock === 0) {
      return (
        <span className="text-[9px] tracking-widest bg-red-500/15 border border-red-500/30 text-red-400 px-2 py-0.5 rounded-md font-black uppercase font-mono shadow-sm">
          AGOTADO
        </span>
      );
    }
    if (product.stock <= 5) {
      return (
        <span className="text-[9px] tracking-widest bg-amber-500/15 border border-amber-500/30 text-yellow-400 px-2 py-0.5 rounded-md font-black uppercase font-mono shadow-sm">
          ÚLTIMAS {product.stock}
        </span>
      );
    }
    return (
      <span className="text-[9px] tracking-wider text-emerald-400 font-mono font-bold">
        DISPONIBLE
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 8) * 0.05, duration: 0.35 }}
      className="group relative flex flex-col justify-between h-full bg-gradient-to-b from-white/[0.04] to-[#0A0F0F] border border-white/[0.06] hover:border-primary/50 rounded-[22px] p-4 transition-all duration-400 ease-out hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(0,229,255,0.1)]"
    >
      {/* Background glow hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.03] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-[22px] pointer-events-none" />

      <div className="relative flex flex-col flex-grow">
        {/* Top Floating Badges */}
        <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between pointer-events-none">
          {hasValidDiscount && discountPercentage > 0 ? (
            <div className="bg-accent text-black font-mono font-black text-[9px] tracking-widest px-2.5 py-1 rounded-lg uppercase shadow-lg shadow-accent/15 flex items-center gap-1 backdrop-blur-md">
              <span>{discountPercentage}% OFF</span>
            </div>
          ) : product.featured ? (
            <div className="bg-primary/95 text-black font-mono font-black text-[9px] tracking-widest px-2.5 py-1 rounded-lg uppercase shadow-lg shadow-primary/15 flex items-center gap-1 backdrop-blur-md">
              <Sparkles size={9} />
              <span>EXCLUSIVO</span>
            </div>
          ) : (
            <div />
          )}

          {/* Wishlist Button */}
          <button 
            type="button"
            onClick={toggleWishlist}
            className={`pointer-events-auto w-8 h-8 rounded-xl bg-black/70 hover:bg-black border border-white/10 flex items-center justify-center transition-all duration-200 shadow-md ${isFavorite ? 'text-red-500 scale-105' : 'text-white/70 hover:text-white hover:scale-105'}`}
            title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
          >
            <Heart size={14} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Product Image Box */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#0A0E0E] border border-white/5 mb-3.5 flex items-center justify-center group-hover:border-primary/20 transition-colors">
          <ProductImage
            src={product.images && product.images.length > 0 ? product.images[0] : undefined}
            alt={product.name}
            category={product.category}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            containerClassName="w-full h-full relative"
          />
        </div>

        {/* Info Area */}
        <div className="flex flex-col flex-grow justify-between space-y-2">
          <div>
            {/* Category & Stock Indicators */}
            <div className="flex items-center justify-between gap-2 min-h-[1.25rem] mb-1">
              <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.2em] truncate">
                {product.category}
              </span>
              {getStockBadge()}
            </div>

            {/* Product Title */}
            <h3 
              className="font-display font-medium text-white group-hover:text-primary transition-colors duration-200 text-sm leading-snug line-clamp-2 min-h-[2.5rem]"
              title={product.name}
            >
              {product.name}
            </h3>
          </div>

          {/* Pricing & Installments Area */}
          <div className="pt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-white font-mono tracking-tight">
                {formatCurrency(hasValidDiscount ? product.discountPrice! : product.price)}
              </span>
              {hasValidDiscount && (
                <span className="text-xs text-gray-400 line-through font-mono">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>

            {/* Cuotas sin interés */}
            {product.installments ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/[0.08] border border-emerald-500/20 text-emerald-400 text-[10px] font-bold font-mono tracking-wide w-fit mt-1.5">
                <CreditCard size={11} className="shrink-0 text-emerald-400" />
                <span>{product.installments} cuotas sin interés</span>
              </div>
            ) : (
              <div className="h-[25px]" />
            )}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-3.5 pt-3 border-t border-white/[0.06] flex gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (product.stock > 0) {
              addToCart(product);
            } else {
              setSelectedProduct(product);
            }
          }}
          className={`flex-grow h-10 rounded-xl font-mono font-black uppercase text-[10px] tracking-wider transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 ${
            product.stock === 0 
              ? 'bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300' 
              : 'bg-white/[0.05] hover:bg-primary border border-white/10 hover:border-primary text-gray-200 hover:text-black font-bold'
          }`}
        >
          <ShoppingCart size={13} />
          <span>{product.stock === 0 ? 'Avisarme Stock' : 'Comprar'}</span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedProduct(product);
          }}
          className="w-10 h-10 bg-white/[0.05] border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95 shrink-0"
          title="Ver ficha completa"
        >
          <Eye size={15} />
        </button>
      </div>
    </motion.div>
  );
};
