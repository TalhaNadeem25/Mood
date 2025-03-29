import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import client from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('MentalHealth');
    console.log('Using database: MentalHealth');
    
    const posts = await db.collection('posts').find().sort({ createdAt: -1 }).toArray();
    console.log(`Found ${posts.length} posts`);
    
    // Convert ObjectId to string for JSON serialization
    const serializedPosts = posts.map(post => ({
      ...post,
      _id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    }));
    
    return NextResponse.json(serializedPosts);
  } catch (error) {
    console.error('Error in GET /api/posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, location } = body;

    // Validate content
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Validate content length
    if (content.length > 1000) {
      return NextResponse.json({ error: 'Content must be less than 1000 characters' }, { status: 400 });
    }

    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected to MongoDB');
    
    const database = client.db('MentalHealth');
    console.log('Using database: MentalHealth');
    
    // TODO: Implement AI moderation
    const isAIApproved = true;

    const post = await database.collection('posts').insertOne({
      content: content.trim(),
      userId,
      location: location?.trim() || null,
      isAIApproved,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('Created new post:', post.insertedId);

    // Emit socket event for real-time updates
    if (global.io) {
      global.io.emit('newPost', { 
        _id: post.insertedId, 
        content: content.trim(),
        userId,
        location: location?.trim() || null,
        isAIApproved,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return NextResponse.json({ 
      _id: post.insertedId, 
      content: content.trim(),
      userId,
      location: location?.trim() || null,
      isAIApproved,
      createdAt: new Date(),
      updatedAt: new Date()
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/posts:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
} 