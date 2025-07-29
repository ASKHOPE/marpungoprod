
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import EventModel from '@/models/Event'; // Mongoose EventModel
import type { Event as EventType } from '@/types/db';

export async function GET() {
  try {
    await connectDB();
    const now = new Date();
    
    const featuredEventsData = await EventModel
      .find({ 
        isArchived: { $ne: true },
        date: { $gte: now.toISOString().split('T')[0] } // Only upcoming or today, compare date part
      })
      .sort({ date: 1 }) // Sort by soonest date first
      .limit(3)
      .lean();

    const processedEvents = featuredEventsData.map(event => ({
      ...event,
      _id: event._id?.toString(),
    }));

    return NextResponse.json(processedEvents);
  } catch (error) {
    console.error('Failed to fetch featured events:', error);
    return NextResponse.json({ error: 'Failed to fetch featured events.' }, { status: 500 });
  }
}
