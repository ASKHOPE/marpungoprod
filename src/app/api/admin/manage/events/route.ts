
import { NextResponse, type NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import EventModel from '@/models/Event'; // Mongoose EventModel
import type { Event as EventType } from '@/types/db'; // For types

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') as 'all' | 'upcoming' | 'past' | 'archived' | null;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let query: mongoose.FilterQuery<EventType> = { isArchived: { $ne: true } };

    if (filter === 'upcoming') {
      query.date = { $gte: startOfToday.toISOString().split('T')[0] }; // Compare date part only
    } else if (filter === 'past') {
      query.date = { $lt: startOfToday.toISOString().split('T')[0] }; // Compare date part only
    } else if (filter === 'archived') {
      query = { isArchived: true };
    } else if (filter === 'all') {
      // query.isArchived = { $ne: true } is already set
    }
    // If no filter or unrecognized, it defaults to non-archived events.

    const allEventsData = await EventModel
      .find(query)
      .sort({ date: -1, createdAt: -1 }) 
      .lean();

    const processedEvents = allEventsData.map(event => ({
      ...event,
      _id: event._id?.toString(),
      // Date is already a string in the model, ensure it's correctly formatted or handled client-side
    }));

    return NextResponse.json(processedEvents);
  } catch (error) {
    console.error('Failed to fetch all events for admin manage page:', error);
    return NextResponse.json({ error: 'Failed to fetch all events for admin manage page.' }, { status: 500 });
  }
}
