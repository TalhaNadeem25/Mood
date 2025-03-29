'use client';

import { motion } from 'framer-motion';
import { MessageCircle, Shield, MapPin, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import io from 'socket.io-client';

interface Post {
  _id: string;
  content: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  isAIApproved: boolean;
  location?: string | null;
}

export default function CommunityPage() {
  const { user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socket, setSocket] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize Socket.IO connection
    const initSocket = async () => {
      await fetch('/api/socket');
      const newSocket = io({
        path: '/api/socket',
      });

      newSocket.on('connect', () => {
        console.log('Connected to Socket.IO server');
      });

      newSocket.on('newPost', (post: Post) => {
        setPosts(prev => [post, ...prev]);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    };

    initSocket();

    // Fetch initial posts
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching posts...');
      const response = await fetch('/api/posts');
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched posts:', data);
      
      if (!Array.isArray(data)) {
        console.error('Received invalid data format:', data);
        throw new Error('Invalid data format received');
      }
      
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Show error to user
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newPost,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      setNewPost('');
    } catch (error) {
      console.error('Error submitting post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Community Support Hub
            </h1>
            <p className="text-gray-400 mt-2">
              Share experiences and find support in a safe, moderated space
            </p>
          </div>
        </motion.div>

        {/* Post Creation */}
        <motion.div 
          className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <form onSubmit={handleSubmitPost} className="space-y-4">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share your thoughts or experiences..."
              className="w-full h-32 p-4 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder-gray-400 resize-none"
            />
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Shield className="w-4 h-4" />
                <span>AI-moderated for safety</span>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !newPost.trim()}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Posting...' : 'Share Post'}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12 text-gray-400">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4">Loading posts...</p>
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <motion.div
                key={post._id}
                className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-full bg-blue-500/20">
                    <MessageCircle className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-200">{post.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                      <span>{new Date(post.createdAt).toLocaleString()}</span>
                      {post.isAIApproved && (
                        <span className="flex items-center gap-1">
                          <Shield className="w-4 h-4" />
                          AI-verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-4" />
              <p>No posts yet. Be the first to share!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 