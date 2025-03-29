import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { clientPromise } from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { mood, prompt, entry, timestamp } = body;

    // Validate entry
    if (!entry || entry.trim().length === 0) {
      return NextResponse.json({ error: 'Journal entry is required' }, { status: 400 });
    }

    console.log('Connecting to MongoDB...');
    const client = await clientPromise;
    console.log('Connected to MongoDB');
    
    const database = client.db('MentalHealth');
    console.log('Using database: MentalHealth');
    
    const journalEntry = await database.collection('journal').insertOne({
      userId,
      mood,
      prompt,
      entry: entry.trim(),
      createdAt: new Date(timestamp),
    });

    console.log('Created new journal entry:', journalEntry.insertedId);

    return NextResponse.json({ 
      _id: journalEntry.insertedId,
      mood,
      prompt,
      entry: entry.trim(),
      createdAt: new Date(timestamp)
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/journal:', error);
    return NextResponse.json({ error: 'Failed to save journal entry' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Connecting to MongoDB...');
    const client = await clientPromise;
    console.log('Connected to MongoDB');
    
    const db = client.db('MentalHealth');
    console.log('Using database: MentalHealth');
    
    const entries = await db.collection('journal')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log(`Found ${entries.length} journal entries`);
    
    // Convert ObjectId to string for JSON serialization
    const serializedEntries = entries.map(entry => ({
      ...entry,
      _id: entry._id.toString(),
      createdAt: entry.createdAt.toISOString()
    }));
    
    return NextResponse.json(serializedEntries);
  } catch (error) {
    console.error('Error in GET /api/journal:', error);
    return NextResponse.json({ error: 'Failed to fetch journal entries' }, { status: 500 });
  }
} 