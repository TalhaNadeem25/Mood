import React from 'react';
import { motion } from 'framer-motion';

interface DataCardProps {
  title: string;
  value: string | number;
  progress?: number;
  color?: string;
  icon?: React.ElementType;
  delay?: number;
  children?: React.ReactNode;
}

const DataCard: React.FC<DataCardProps> = ({
  title,
  value,
  progress,
  color = "from-futuristic-blue to-futuristic-purple",
  icon: Icon,
  delay = 0,
  children
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass-panel rounded-2xl overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-bl-3xl" />
      
      {Icon && (
        <div className="absolute top-4 right-4 opacity-20">
          <Icon className="w-8 h-8" />
        </div>
      )}
      
      <div className="p-6 z-10 relative">
        <h3 className="text-sm uppercase tracking-wider text-white/70 mb-1">{title}</h3>
        
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: delay + 0.2 }}
          className="flex items-end gap-2"
        >
          <span className={`text-2xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
            {value}
          </span>
        </motion.div>
        
        {progress !== undefined && (
          <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: delay + 0.3 }}
              className={`h-full rounded-full bg-gradient-to-r ${color}`}
            />
          </div>
        )}
        
        {children}
      </div>
    </motion.div>
  );
};

export default DataCard;