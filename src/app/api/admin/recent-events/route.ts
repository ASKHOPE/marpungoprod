
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import EventModel from '@/models/Event'; // Mongoose EventModel
import type { Event as EventType } from '@/types/db';

export async function GET() {
  try {
    await connectDB();

    const recentEventsData = await EventModel
      .find({ isArchived: { $ne: true } }) // Fetch non-archived events
      .sort({ date: -1, createdAt: -1 }) // Sort by event date descending, then by creation
      .limit(5)
      .lean(); // Use .lean() for plain JS objects

    const processedEvents = recentEventsData.map(event => ({
      ...event,
      _id: event._id?.toString(), // Safer: use optional chaining
      date: event.date, // Event date is already a string in the model
      // isArchived should be present from lean() due to schema default
    }));

    return NextResponse.json(processedEvents);
  } catch (error) {
    console.error('Failed to fetch recent events:', error);
    return NextResponse.json({ error: 'Failed to fetch recent events.' }, { status: 500 });
  }
}
