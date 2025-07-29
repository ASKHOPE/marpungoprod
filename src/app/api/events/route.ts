
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb'; // Mongoose connectDB
import EventModel from '@/models/Event'; // Mongoose EventModel
// import type { Event as EventType } from '@/types/db'; // EventType not directly used here for GET all

export async function GET() {
  console.log("API Route: /api/events GET request received.");
  try {
    console.log("API Route: Attempting connectDB()...");
    await connectDB();
    console.log("API Route: connectDB() successful.");

    console.log("API Route: Attempting EventModel.find({ isArchived: { $ne: true } }).lean()...");
    const eventsData = await EventModel
      .find({ isArchived: { $ne: true } }) // Fetch non-archived events
      .sort({ date: 1, createdAt: -1 }) // Sort by event date ascending, then by creation
      .lean(); // Use .lean() for plain JS objects, faster reads
    console.log(`API Route: EventModel.find() successful. Found ${eventsData.length} events.`);

    const processedEvents = eventsData.map(event => ({
      ...event,
      _id: event._id.toString(), // Ensure _id is a string
      // date: event.date instanceof Date ? event.date.toISOString() : event.date, // Keep as is from DB for now
    }));

    console.log("API Route: Successfully processed events. Sending response.");
    return NextResponse.json(processedEvents);
  } catch (error) {
    console.error('API Error in /api/events route:', error);
    let message = 'An unexpected error occurred while fetching events from the API.';
    let errorDetails: any = {};

    if (error instanceof Error) {
      message = error.message;
      errorDetails = {
        name: error.name,
        message: error.message,
        // stack: error.stack, // Stack can be very long for client, primarily for server log
      };
    } else {
      errorDetails = { error: String(error) };
    }
    console.log("API Route: Error caught. Sending 500 response with error details:", errorDetails);
    // Ensure a JSON response is sent for errors
    return NextResponse.json({ error: message, details: errorDetails }, { status: 500 });
  }
}
