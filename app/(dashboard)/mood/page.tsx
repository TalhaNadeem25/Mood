'use client';

import { useState } from 'react';

export default function MoodPage() {
  const [mood, setMood] = useState<string>('');

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Mood Tracker</h1>
      {/* Add mood tracking UI here */}
    </div>
  );
} 