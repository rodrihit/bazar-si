import { motion } from 'motion/react';

interface LogoProps {
  className?: string;
  showYears?: boolean;
}

export default function Logo({ className = '', showYears = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative bg-primary text-white p-2 md:p-3 rounded-2xl rounded-br-none min-w-[80px] md:min-w-[100px] flex flex-col items-center justify-center shadow-lg"
        >
          <span className="text-[10px] md:text-xs font-serif italic leading-none opacity-90">bazar</span>
          <span className="text-xl md:text-2xl font-black leading-none tracking-tighter uppercase">yes</span>
          
          {/* Bubble tail */}
          <div className="absolute -bottom-2 right-0 w-4 h-4 bg-primary rotate-45" />
        </motion.div>

        {showYears && (
          <motion.div 
            initial={{ scale: 0, x: 20 }}
            animate={{ scale: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute -top-3 -right-3 w-10 h-10 md:w-12 md:h-12 bg-accent rounded-full border-2 border-white flex flex-col items-center justify-center shadow-md rotate-12"
          >
            <span className="text-[12px] md:text-[14px] font-black text-black leading-none">35</span>
            <span className="text-[6px] md:text-[7px] font-bold text-black uppercase">años</span>
          </motion.div>
        )}
      </div>
      
      <div className="flex flex-col">
        <span className="font-display font-black text-lg md:text-xl leading-none tracking-tighter uppercase text-white">
          BAZAR <span className="text-primary italic">YES</span>
        </span>
        <span className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-bold text-gray-500">
          PARANÁ • ENTRE RÍOS
        </span>
      </div>
    </div>
  );
}
