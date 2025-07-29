
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import EventModel from '@/models/Event'; // Mongoose EventModel
import type { Event as EventType } from '@/types/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const eventSlug = params.id;
    if (!eventSlug) {
      return NextResponse.json({ error: 'Event ID (slug) is required' }, { status: 400 });
    }

    const event = await EventModel.findOne({ id: eventSlug, isArchived: { $ne: true } }).lean();

    if (!event) {
      return NextResponse.json({ error: 'Event not found or has been archived' }, { status: 404 });
    }
    
    const eventWithStringId = { ...event, _id: event._id?.toString() };
    return NextResponse.json(eventWithStringId);

  } catch (error) {
    console.error('Failed to fetch event by slug:', error);
    return NextResponse.json({ error: 'Internal Server Error. Failed to fetch event.' }, { status: 500 });
  }
}
