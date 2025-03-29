'use client';

import React from 'react';
import { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import { motion, AnimatePresence } from 'framer-motion';
import { CameraIcon, VideoOffIcon, Loader2Icon, SmileIcon, FrownIcon, MehIcon } from 'lucide-react';

export default function MoodPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [mood, setMood] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [moodHistory, setMoodHistory] = useState<{mood: string; timestamp: Date}[]>([]);
  const [confidence, setConfidence] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string>('');
  const [detectionActive, setDetectionActive] = useState(false);

  // Mood descriptions
  const moodDescriptions: Record<string, {icon: JSX.Element, description: string, color: string}> = {
    happy: {
      icon: <SmileIcon className="w-8 h-8 text-yellow-400" />,
      description: "You're looking happy! Keep that positive energy going.",
      color: "bg-gradient-to-br from-yellow-400 to-amber-500"
    },
    sad: {
      icon: <FrownIcon className="w-8 h-8 text-blue-400" />,
      description: "You seem a bit down. Remember, it's okay to feel this way.",
      color: "bg-gradient-to-br from-blue-400 to-indigo-600"
    },
    angry: {
      icon: <FrownIcon className="w-8 h-8 text-red-500" />,
      description: "You appear angry. Take a deep breath and try to relax.",
      color: "bg-gradient-to-br from-red-500 to-rose-600"
    },
    fearful: {
      icon: <FrownIcon className="w-8 h-8 text-purple-500" />,
      description: "You look fearful. You're stronger than you think.",
      color: "bg-gradient-to-br from-purple-500 to-violet-600"
    },
    disgusted: {
      icon: <MehIcon className="w-8 h-8 text-green-500" />,
      description: "You seem disgusted. Maybe take a break from whatever's bothering you.",
      color: "bg-gradient-to-br from-green-500 to-emerald-600"
    },
    surprised: {
      icon: <SmileIcon className="w-8 h-8 text-orange-400" />,
      description: "You look surprised! Hope it's a pleasant surprise.",
      color: "bg-gradient-to-br from-orange-400 to-pink-500"
    },
    neutral: {
      icon: <MehIcon className="w-8 h-8 text-gray-400" />,
      description: "You appear neutral. How are you really feeling?",
      color: "bg-gradient-to-br from-gray-400 to-slate-600"
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models')
      ]);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load emotion detection models. Please refresh the page.');
      setIsLoading(false);
      console.error(err);
    }
  };

  const startVideo = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 1280, 
          height: 720,
          facingMode: 'user' 
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setDetectionActive(true);
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions to use this feature.');
      setIsCameraActive(false);
      console.error(err);
    }
  };

  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
      setDetectionActive(false);
    }
  };

  const captureMood = () => {
    if (mood) {
      const newEntry = {
        mood,
        timestamp: new Date(),
        confidence
      };
      setMoodHistory(prev => [newEntry, ...prev].slice(0, 10)); // Keep last 10 entries
    }
  };

  useEffect(() => {
    let animationFrame: number;
    let detectionInterval: NodeJS.Timeout;

    const detectEmotions = async () => {
      if (!detectionActive || !videoRef.current || !canvasRef.current) return;

      try {
        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        if (detections && detections.length > 0) {
          const expressions = detections[0].expressions;
          const [dominantMood, confidenceValue] = Object.entries(expressions).reduce(
            (a, b) => a[1] > b[1] ? a : b
          );
          
          setMood(dominantMood);
          setConfidence(Math.round(confidenceValue * 100));

          // Draw canvas
          const dims = faceapi.matchDimensions(canvasRef.current, videoRef.current, true);
          const resizedDetections = faceapi.resizeResults(detections, dims);
          
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
          }
        } else {
          setMood('');
          setConfidence(0);
        }
      } catch (err) {
        console.error('Detection error:', err);
      }

      animationFrame = requestAnimationFrame(detectEmotions);
    };

    if (isCameraActive) {
      detectionInterval = setInterval(detectEmotions, 500); // Run detection every 500ms
    }

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      if (detectionInterval) clearInterval(detectionInterval);
    };
  }, [isCameraActive, detectionActive]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              AI Mood Tracker
            </h1>
            <p className="text-gray-400 mt-2">
              Real-time facial expression analysis to understand your emotions
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={isCameraActive ? stopVideo : startVideo}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors"
            >
              {isCameraActive ? (
                <>
                  <VideoOffIcon className="w-5 h-5" />
                  <span>Stop Camera</span>
                </>
              ) : (
                <>
                  <CameraIcon className="w-5 h-5" />
                  <span>Start Camera</span>
                </>
              )}
            </button>
            
            {mood && (
              <button
                onClick={captureMood}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors"
                disabled={!mood}
              >
                Save Current Mood
              </button>
            )}
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div 
            className="p-4 rounded-lg bg-red-900/50 border border-red-700 text-red-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <motion.div 
            className="flex flex-col items-center justify-center p-12 rounded-xl bg-white/5 backdrop-blur-md border border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Loader2Icon className="w-12 h-12 animate-spin text-blue-400 mb-4" />
            <h2 className="text-xl font-medium">Loading AI Models</h2>
            <p className="text-gray-400 mt-2">This may take a few moments...</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Camera Feed */}
            <div className="lg:col-span-2 space-y-4">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-white/10">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                />
                
                {!isCameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 gap-4">
                    <CameraIcon className="w-12 h-12 text-white/50" />
                    <p className="text-white/80">Camera is inactive</p>
                    <button
                      onClick={startVideo}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors"
                    >
                      <CameraIcon className="w-5 h-5" />
                      <span>Enable Camera</span>
                    </button>
                  </div>
                )}
              </div>
              
              {/* Detection Controls */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${detectionActive ? 'bg-green-500' : 'bg-gray-500'}`} />
                  <span className="text-sm">
                    {detectionActive ? 'Detection active' : 'Detection paused'}
                  </span>
                </div>
                
                <button
                  onClick={() => setDetectionActive(!detectionActive)}
                  className="text-sm px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
                  disabled={!isCameraActive}
                >
                  {detectionActive ? 'Pause Detection' : 'Resume Detection'}
                </button>
              </div>
            </div>
            
            {/* Mood Display */}
            <div className="space-y-6">
              <motion.div 
                className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  Current Mood Analysis
                </h2>
                
                {mood ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${moodDescriptions[mood]?.color || 'bg-gray-600'}`}>
                        {moodDescriptions[mood]?.icon || <SmileIcon className="w-8 h-8" />}
                      </div>
                      <div>
                        <div className="text-2xl font-bold">
                          {mood.charAt(0).toUpperCase() + mood.slice(1)}
                        </div>
                        <div className="text-sm text-gray-400">
                          Confidence: {confidence}%
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-300">
                      {moodDescriptions[mood]?.description || 'Your current emotional state has been detected.'}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <MehIcon className="w-12 h-12 text-gray-500 mb-4" />
                    <p className="text-gray-400">
                      {isCameraActive 
                        ? 'Face the camera to detect your mood'
                        : 'Enable camera to begin mood detection'}
                    </p>
                  </div>
                )}
              </motion.div>
              
              {/* Mood History */}
              <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 p-6">
                <h2 className="text-xl font-semibold mb-4">Mood History</h2>
                
                {moodHistory.length > 0 ? (
                  <div className="space-y-3">
                    {moodHistory.map((entry, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${moodDescriptions[entry.mood]?.color || 'bg-gray-600'}`}>
                            {moodDescriptions[entry.mood]?.icon || <SmileIcon className="w-4 h-4" />}
                          </div>
                          <span className="capitalize">{entry.mood}</span>
                        </div>
                        <span className="text-sm text-gray-400">
                          {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    <p>No mood history yet</p>
                    <p className="text-sm mt-1">Detected moods will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}