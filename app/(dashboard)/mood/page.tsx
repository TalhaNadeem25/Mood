'use client';

import { motion } from 'framer-motion';
import { CameraIcon, FrownIcon, Loader2Icon, MehIcon, SmileIcon, VideoOffIcon, Volume2Icon, VolumeXIcon } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { moodSongs } from '@/app/data/moodSongs';

// TypeScript declarations for Spotify Web Playback SDK
declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: {
      Player: new (config: {
        name: string;
        getOAuthToken: (callback: (token: string) => void) => void;
      }) => SpotifyPlayer;
    };
  }
}

interface SpotifyPlayer {
  addListener(event: string, callback: (data: { device_id: string }) => void): void;
  connect(): Promise<void>;
  disconnect(): void;
  pause(): Promise<void>;
}

// Enhanced mood playlists with multiple options per emotion
const moodPlaylists = {
  happy: {
    playlists: [
      { id: '37i9dQZF1DX3rxVfibe1L0', name: 'Happy Hits' },
      { id: '37i9dQZF1DX9XIFQuFvzM4', name: 'Mood Booster' },
      { id: '37i9dQZF1DX2sUQwD7tbmL', name: 'Feel-Good Indie Rock' }
    ],
    description: 'Uplifting and energetic music to maintain your positive vibes'
  },
  sad: {
    playlists: [
      { id: '37i9dQZF1DX7qK8ma5wgG1', name: 'Sad Songs' },
      { id: '37i9dQZF1DXbm0dp7JzqHZ', name: 'Sad Lofi' },
      { id: '37i9dQZF1DX889U0CL85jj', name: 'Life Sucks' }
    ],
    description: 'Comforting melodies to help process your emotions'
  },
  angry: {
    playlists: [
      { id: '37i9dQZF1DX4sWSpwq3LiO', name: 'Calming Piano' },
      { id: '37i9dQZF1DX2TRYkJECvfC', name: 'Peaceful Guitar' },
      { id: '37i9dQZF1DWZqd5JICZI0u', name: 'Peaceful Meditation' }
    ],
    description: 'Soothing music to help calm your mind'
  },
  fearful: {
    playlists: [
      { id: '37i9dQZF1DWXe9gFZP0gtP', name: 'Ambient Relaxation' },
      { id: '37i9dQZF1DX9uKNf5jGX6m', name: 'Stress Relief' },
      { id: '37i9dQZF1DX0jgyAiPl8Af', name: 'Lofi Sleep' }
    ],
    description: 'Gentle ambient sounds to reduce anxiety'
  },
  neutral: {
    playlists: [
      { id: '37i9dQZF1DX4dyzvuaRJ0n', name: 'Peaceful Meditation' },
      { id: '37i9dQZF1DX1s9knjP51Oa', name: 'Calm Vibes' },
      { id: '37i9dQZF1DX3Ogo9pFvBkY', name: 'Ambient Chill' }
    ],
    description: 'Balanced music to maintain your steady state'
  }
};

// Journaling prompts based on mood
const journalingPrompts = {
  happy: [
    "What made you smile today?",
    "How can you spread this joy to others?",
    "Describe three things that contributed to your happiness",
    "What positive changes have you noticed recently?"
  ],
  sad: [
    "What's weighing on your mind?",
    "When did you last feel better, and what changed?",
    "What small thing could brighten your day right now?",
    "What would you tell a friend feeling this way?"
  ],
  angry: [
    "What triggered this feeling?",
    "How could this situation be viewed differently?",
    "What would help you feel more at peace?",
    "What's one positive action you could take right now?"
  ],
  fearful: [
    "What's causing your anxiety?",
    "What's the worst that could happen, and how would you handle it?",
    "What has helped you feel safe in the past?",
    "What's one small step you could take to feel more secure?"
  ],
  neutral: [
    "How would you like to feel today?",
    "What's one thing you're looking forward to?",
    "What's something you'd like to improve?",
    "What's been on your mind lately?"
  ]
};

// Create a client component for Spotify auth handling
function SpotifyAuthHandler({ onToken }: { onToken: (token: string) => void }) {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      console.error('Spotify auth error:', error);
      return;
    }

    if (token) {
      onToken(token);
      // Remove the token from the URL
      window.history.replaceState({}, '', '/mood');
    }
  }, [searchParams, onToken]);

  return null;
}

export default function MoodPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [mood, setMood] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [moodHistory, setMoodHistory] = useState<{mood: string; timestamp: Date}[]>([]);
  const [confidence, setConfidence] = useState<number>(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [error, setError] = useState<string>('');
  const [detectionActive, setDetectionActive] = useState(false);
  const [recommendations, setRecommendations] = useState<Array<{
    name: string;
    artist: string;
    id: string;
    imageUrl: string;
    youtubeUrl: string;
  }>>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');
  const [journalEntry, setJournalEntry] = useState<string>('');
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [faceapi, setFaceapi] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mood descriptions
  const moodDescriptions: Record<string, {icon: React.ReactNode, description: string, color: string}> = {
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
    import('@vladmandic/face-api').then((module) => {
      setFaceapi(module);
      loadModels(module);
    });
  }, []);

  const loadModels = async (faceapiModule: any) => {
    try {
      setIsLoading(true);
      await Promise.all([
        faceapiModule.nets.ssdMobilenetv1.loadFromUri('/models'),
        faceapiModule.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapiModule.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapiModule.nets.faceExpressionNet.loadFromUri('/models'),
        faceapiModule.nets.faceRecognitionNet.loadFromUri('/models')
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
      // Check if WebGL is available
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        throw new Error('WebGL is not supported in your browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 1280, 
          height: 720,
          facingMode: 'user' 
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraActive(true);
          setDetectionActive(true);
        };
      }
    } catch (err) {
      setError('Camera access denied or WebGL not supported. Please check your browser settings.');
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

  const fetchRecommendations = async (currentMood: string) => {
    setIsLoadingRecommendations(true);
    try {
      // Get songs for the current mood, or return empty array if mood doesn't exist
      const moodSpecificSongs = moodSongs[currentMood as keyof typeof moodSongs] || [];
      // Randomly select up to 5 songs
      const shuffled = [...moodSpecificSongs].sort(() => 0.5 - Math.random());
      setRecommendations(shuffled.slice(0, 5));
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('Failed to fetch song recommendations');
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const captureMood = async () => {
    if (!mood) return;

    try {
      const response = await fetch('/api/mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mood,
          confidence,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save mood');
      }

      const newEntry = {
        mood,
        timestamp: new Date(),
        confidence
      };
      setMoodHistory(prev => [newEntry, ...prev].slice(0, 10)); // Keep last 10 entries
      await fetchRecommendations(mood);
    } catch (err) {
      console.error('Error saving mood:', err);
      setError('Failed to save mood. Please try again.');
    }
  };

  useEffect(() => {
    let animationFrame: number;

    const detectEmotions = async () => {
      if (!detectionActive || !videoRef.current || !canvasRef.current || 
          !videoRef.current.videoWidth || !videoRef.current.videoHeight) {
        console.log('Detection skipped:', {
          detectionActive,
          hasVideo: !!videoRef.current,
          hasCanvas: !!canvasRef.current,
          videoWidth: videoRef.current?.videoWidth,
          videoHeight: videoRef.current?.videoHeight
        });
        return;
      }

      try {
        // Initialize WebGL backend
        const tf = faceapi.tf as unknown as {
          setBackend: (backend: string) => Promise<void>;
          ready: () => Promise<void>;
        };
        await tf.setBackend('webgl');
        await tf.ready();

        console.log('Running face detection...');
        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.SsdMobilenetv1Options())
          .withFaceLandmarks()
          .withFaceExpressions();

        console.log('Detection results:', detections);

        if (detections && detections.length > 0) {
          const expressions = detections[0].expressions as Record<string, number>;
          console.log('Detected expressions:', expressions);
          const [dominantMood, confidenceValue] = Object.entries(expressions).reduce(
            (a, b) => a[1] > b[1] ? a : b
          ) as [string, number];
          
          setMood(dominantMood);
          setConfidence(Math.round(confidenceValue * 100));

          // Draw canvas with proper dimensions
          const displaySize = {
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight
          };
          
          if (displaySize.width && displaySize.height) {
            faceapi.matchDimensions(canvasRef.current, displaySize);
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
              faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
            }
          }
        } else {
          setMood('');
          setConfidence(0);
        }
      } catch (err) {
        console.error('Detection error:', err);
        if (err instanceof Error && err.message.includes('WebGL')) {
          setError('WebGL error occurred. Please try refreshing the page or using a different browser.');
        }
      }

      animationFrame = requestAnimationFrame(detectEmotions);
    };

    if (isCameraActive) {
      detectEmotions();
    }

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isCameraActive, detectionActive]);

  // Function to get a random prompt for the current mood
  const getRandomPrompt = (currentMood: string) => {
    const prompts = journalingPrompts[currentMood as keyof typeof journalingPrompts] || journalingPrompts.neutral;
    return prompts[Math.floor(Math.random() * prompts.length)];
  };

  // Function to toggle music
  const toggleMusic = async () => {
    if (!mood) return;
    setIsMusicPlaying(!isMusicPlaying);
  };

  // Update recommendations when mood changes
  useEffect(() => {
    if (mood && confidence > 50) {
      fetchRecommendations(mood);
    }
  }, [mood, confidence]);

  // Function to save journal entry
  const saveJournalEntry = async () => {
    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mood,
          prompt: selectedPrompt,
          entry: journalEntry,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save journal entry');
      }

      setJournalEntry('');
      setShowJournalModal(false);
    } catch (err) {
      console.error('Error saving journal entry:', err);
      setError('Failed to save journal entry. Please try again.');
    }
  };

  // Update prompt when mood changes
  useEffect(() => {
    if (mood) {
      setSelectedPrompt(getRandomPrompt(mood));
    }
  }, [mood]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
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
                Real-time facial expression analysis with mood-based music
              </p>
            </div>
            
            <div className="flex gap-4">
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

                {/* Song Recommendations */}
                <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 p-6">
                  <h2 className="text-xl font-semibold mb-4">Song Recommendations</h2>
                  
                  {isLoadingRecommendations ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2Icon className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : recommendations.length > 0 ? (
                    <div className="space-y-4">
                      {recommendations.map((track) => (
                        <motion.div
                          key={track.id}
                          className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          {track.imageUrl && (
                            <img 
                              src={track.imageUrl} 
                              alt={track.name}
                              className="w-12 h-12 rounded-md object-cover"
                            />
                          )}
                          <div className="flex-grow">
                            <div className="font-medium">{track.name}</div>
                            <div className="text-sm text-gray-400">{track.artist}</div>
                          </div>
                          <a
                            href={track.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                          >
                            <Volume2Icon className="w-4 h-4" />
                          </a>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-400">
                      <p>No recommendations yet</p>
                      <p className="text-sm mt-1">Save your mood to get song recommendations</p>
                    </div>
                  )}
                </div>
                {/* Add this inside the mood display section, after the current mood analysis */}
                {mood && (
                  <div className="space-y-4 mt-6">
                    {/* Music Recommendation */}
                    <div className="p-4 rounded-lg bg-white/5">
                      <h3 className="text-sm font-medium text-gray-300">Now Playing:</h3>
                      <p className="text-white">{moodPlaylists[mood as keyof typeof moodPlaylists]?.description}</p>
                    </div>

                    {/* Journal Prompt */}
                    <div className="p-4 rounded-lg bg-white/5">
                      <h3 className="text-sm font-medium text-gray-300">Reflection Prompt:</h3>
                      <p className="text-white mt-1">{selectedPrompt}</p>
                      <button
                        onClick={() => setShowJournalModal(true)}
                        className="mt-3 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors text-sm"
                      >
                        Start Journaling
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Journal Modal */}
        {showJournalModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full">
              <h2 className="text-xl font-semibold mb-4">Journal Entry</h2>
              <p className="text-gray-300 mb-4">{selectedPrompt}</p>
              <textarea
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
                className="w-full h-40 p-3 rounded-lg bg-gray-700 text-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Write your thoughts here..."
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowJournalModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    saveJournalEntry();
                    setShowJournalModal(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors"
                >
                  Save Entry
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Suspense>
  );
}