import React, { useState } from 'react';
import { ImageOff, Sparkles } from 'lucide-react';

interface ProductImageProps {
  src?: string;
  alt?: string;
  className?: string;
  containerClassName?: string;
  category?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt = 'Producto Bazar YES',
  className = 'w-full h-full object-cover',
  containerClassName = 'w-full h-full relative overflow-hidden bg-black/40',
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isValidSrc = src && typeof src === 'string' && src.trim() !== '' && !src.startsWith('file://');

  if (!isValidSrc || hasError) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 text-center select-none bg-gradient-to-b from-[#121A1A] to-[#0A0F0F] border border-white/5 ${containerClassName}`}>
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary/80 mb-2 shadow-inner">
          <ImageOff size={20} />
        </div>
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-mono">
          Imagen no disponible
        </span>
        <span className="text-[9px] text-primary/60 font-semibold tracking-widest uppercase mt-0.5 flex items-center gap-1">
          <Sparkles size={8} /> Bazar YES Paraná
        </span>
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      {isLoading && (
        <div className="absolute inset-0 bg-white/[0.03] animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        loading="lazy"
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
};

export default ProductImage;
