'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  CalendarIcon, 
  ChatBubbleLeftIcon, 
  ChartBarIcon, 
  Cog6ToothIcon,
  DocumentTextIcon,
  BoltIcon,
  HeartIcon,
  ArrowPathIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import ProgressRing from '@/components/dashboard/ProgressRing';
import HexButton from '@/components/dashboard/HexButton';
import DataCard from '@/components/dashboard/DataCard';
import ActivityItem from '@/components/dashboard/ActivityItem';

export interface DashboardContentProps {
  fullName: string;
}

export default function DashboardContent({ fullName }: DashboardContentProps) {
  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Animation variants
  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.8 } }
  };

  const container = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={fadeIn}
      className="min-h-screen bg-background mesh-gradient text-white p-4 md:p-8 relative overflow-hidden"
    >
      {/* Background Effects */}
      <div className="fixed inset-0 bg-futuristic-grid opacity-10"></div>
      <div className="fixed inset-0 bg-data-flow opacity-5"></div>
      
      <motion.div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-glow-sphere opacity-30"
        animate={{ 
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="max-w-7xl mx-auto relative z-10 space-y-6">
        {/* Header Section */}
        <motion.div
          variants={item}
          className="glass-panel rounded-3xl overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-futuristic-purple/20 via-futuristic-blue/10 to-transparent"></div>
          
          <div className="p-8 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <p className="text-white/70 text-sm tracking-wider mb-1">{currentDate}</p>
                  <h1 className="text-4xl md:text-5xl font-bold neon-text">
                    Hello, {fullName}
                  </h1>
                  <p className="text-white/70 mt-2">
                    Your mental wellness journey awaits
                  </p>
                </motion.div>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex items-center gap-3"
              >
                <div className="hidden md:block">
                  <ProgressRing progress={78} size={100} className="flex-shrink-0" />
                </div>
                
                <div className="glass-panel rounded-xl p-3 md:p-4">
                  <h3 className="text-xs uppercase tracking-wider text-white/60 mb-1">Current Streak</h3>
                  <div className="flex items-center gap-2">
                    <BoltIcon className="w-5 h-5 text-yellow-400" />
                    <span className="text-xl md:text-2xl font-bold">7 Days</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          variants={container}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
        >
          <DataCard
            title="Emotional Balance"
            value="85%"
            progress={85}
            color="from-green-400 to-emerald-500"
            icon={HeartIcon}
            delay={0.1}
          />
          
          <DataCard
            title="Weekly Insights"
            value="3 New"
            progress={30}
            color="from-futuristic-purple to-blue-500"
            icon={BoltIcon}
            delay={0.2}
          />
          
          <DataCard
            title="Mindfulness"
            value="6.2 hrs"
            progress={62}
            color="from-amber-400 to-orange-500"
            icon={ArrowPathIcon}
            delay={0.3}
          />
        </motion.div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Recent Activities */}
          <motion.div
            variants={item}
            className="glass-panel rounded-2xl overflow-hidden"
          >
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-futuristic-blue" />
                Recent Activities
              </h2>
              
              <div className="space-y-1">
                <ActivityItem 
                  time="2h ago" 
                  activity="Mood check-in" 
                  status="Happy" 
                  color="text-green-400" 
                  index={0}
                />
                <ActivityItem 
                  time="1d ago" 
                  activity="AI Chat session" 
                  status="15 mins" 
                  color="text-blue-400" 
                  index={1}
                />
                <ActivityItem 
                  time="2d ago" 
                  activity="Reflection" 
                  status="Complete" 
                  color="text-purple-400" 
                  index={2}
                />
              </div>
            </div>
          </motion.div>

          {/* Wellness Goals */}
          <motion.div
            variants={item}
            className="glass-panel rounded-2xl overflow-hidden"
          >
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <ChartBarIcon className="w-5 h-5 mr-2 text-futuristic-purple" />
                Wellness Goals
              </h2>
              
              <div className="space-y-6">
                {[
                  { goal: 'Daily Meditation', progress: 80, color: 'from-orange-400 to-red-500' },
                  { goal: 'Mood Tracking', progress: 100, color: 'from-green-400 to-emerald-500' },
                  { goal: 'Journaling', progress: 60, color: 'from-blue-400 to-indigo-500' },
                ].map((item, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * (i + 1) }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-white/90">{item.goal}</span>
                      <span className="text-sm text-white/70">{item.progress}%</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progress}%` }}
                        transition={{ duration: 1, delay: 0.2 * (i + 1) }}
                        className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div 
          variants={container}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <HexButton 
            icon={DocumentTextIcon} 
            label="New Check-in" 
            color="bg-gradient-to-tr from-futuristic-blue/20 to-futuristic-cyan/20" 
          />
          <HexButton 
            icon={ChatBubbleLeftIcon} 
            label="Start Chat" 
            color="bg-gradient-to-tr from-green-500/20 to-emerald-400/20" 
          />
          <HexButton 
            icon={ChartBarIcon} 
            label="View Reports" 
            color="bg-gradient-to-tr from-futuristic-purple/20 to-violet-500/20" 
          />
          <HexButton 
            icon={CogIcon} 
            label="Settings" 
            color="bg-gradient-to-tr from-gray-500/20 to-gray-600/20" 
          />
        </motion.div>

        {/* Footer */}
        <motion.div
          variants={fadeIn}
          className="text-center text-white/50 text-xs mt-10"
        >
          <p>Emotional Journey Dashboard • v2.0</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
