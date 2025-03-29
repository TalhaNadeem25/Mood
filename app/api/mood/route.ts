import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mood, confidence, timestamp } = body;
    
    const client = await clientPromise;
    const db = client.db("MentalHealth");
    const result = await db.collection("moods").insertOne({
      mood,
      confidence,
      timestamp: new Date(timestamp),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch {
    return NextResponse.json({ error: "Failed to save mood" }, { status: 500 });
  }
} 