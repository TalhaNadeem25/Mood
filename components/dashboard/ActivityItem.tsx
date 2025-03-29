import React from 'react';
import { motion } from 'framer-motion';

interface ActivityItemProps {
  time: string;
  activity: string;
  status: string;
  color: string;
  index: number;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ time, activity, status, color, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.1 * index }}
      className="flex items-center justify-between py-3 border-b border-white/10 last:border-0 relative overflow-hidden group"
    >
      <motion.div 
        className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-futuristic-purple to-futuristic-blue"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.4, delay: 0.2 * index }}
      />
      
      <div className="pl-3">
        <p className="text-sm font-medium text-white/90">{activity}</p>
        <p className="text-xs text-white/60">{time}</p>
      </div>
      
      <div className="flex items-center">
        <motion.div
          className={`h-2 w-2 rounded-full mr-2 ${color}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 * index }}
        />
        <span className={`text-sm font-medium ${color}`}>{status}</span>
      </div>
      
      <motion.div 
        className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
      />
    </motion.div>
  );
};

export default ActivityItem;