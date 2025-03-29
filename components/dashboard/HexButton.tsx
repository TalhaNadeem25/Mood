import React from 'react';
import { motion } from 'framer-motion';

interface HexButtonProps {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  color?: string;
}

const HexButton: React.FC<HexButtonProps> = ({ 
  icon: Icon, 
  label, 
  onClick, 
  color = "bg-gradient-to-tr from-futuristic-purple/20 to-futuristic-blue/20" 
}) => {
  return (
    <motion.button
      onClick={onClick}
      className={`relative w-full h-32 group ${color}`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute inset-0 glass-panel clip-path-polygon overflow-hidden">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-futuristic-purple/10 to-futuristic-blue/10 transition-opacity duration-300"></div>
        
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        <div className="flex flex-col items-center justify-center h-full p-4 z-10 relative">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Icon className="w-8 h-8 mb-2 text-white/90" />
          </motion.div>
          
          <motion.span 
            className="text-sm font-medium tracking-wide"
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {label}
          </motion.span>
          
          <motion.div 
            className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-futuristic-purple to-futuristic-blue opacity-0 group-hover:opacity-100"
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </motion.button>
  );
};

export default HexButton;