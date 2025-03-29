'use client';

import { motion } from 'framer-motion';
import { MapPin, Filter, Phone, DollarSign, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Resource {
  id: string;
  name: string;
  type: 'therapist' | 'hotline' | 'support_group';
  address: string;
  phone: string;
  cost: 'free' | 'low' | 'medium' | 'high';
  hours: string;
  rating: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  // const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all',
    cost: 'all',
    rating: 0
  });

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch('/api/resources');
        const data = await response.json();
        setResources(data);
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        // setIsLoading(false);
      }
    };

    fetchResources();
  }, []);

  const filteredResources = resources.filter(resource => {
    if (filters.type !== 'all' && resource.type !== filters.type) return false;
    if (filters.cost !== 'all' && resource.cost !== filters.cost) return false;
    if (filters.rating > 0 && resource.rating < filters.rating) return false;
    return true;
  });

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
              Mental Health Resources
            </h1>
            <p className="text-gray-400 mt-2">
              Find nearby support services and professionals
            </p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div 
          className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="therapist">Therapists</option>
                <option value="hotline">Hotlines</option>
                <option value="support_group">Support Groups</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-gray-400" />
              <select
                value={filters.cost}
                onChange={(e) => setFilters(prev => ({ ...prev, cost: e.target.value }))}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Costs</option>
                <option value="free">Free</option>
                <option value="low">Low Cost</option>
                <option value="medium">Medium Cost</option>
                <option value="high">High Cost</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-400">Min Rating:</span>
              <select
                value={filters.rating}
                onChange={(e) => setFilters(prev => ({ ...prev, rating: Number(e.target.value) }))}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="0">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Resources List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredResources.map((resource) => (
            <motion.div
              key={resource.id}
              className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-blue-500/20">
                  <MapPin className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{resource.name}</h3>
                  <div className="mt-2 space-y-2 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{resource.phone}</span>
                    </div>
                    {resource.address !== 'N/A' && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{resource.address}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{resource.hours}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span className="capitalize">{resource.cost}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-yellow-400">★</span>
                    <span>{resource.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {filteredResources.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              <MapPin className="w-12 h-12 mx-auto mb-4" />
              <p>No resources found matching your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 