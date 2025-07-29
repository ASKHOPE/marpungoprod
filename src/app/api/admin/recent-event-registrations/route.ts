
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import EventRegistrationModel from '@/models/EventRegistration';
// type EventRegistration from types/db not strictly needed here

export async function GET() {
  try {
    await connectDB();

    const recentRegistrationsData = await EventRegistrationModel
      .find()
      .sort({ registeredAt: -1 }) // Sort by registration date descending
      .limit(5)
      .lean(); 

    const processedRegistrations = recentRegistrationsData.map(reg => ({
      ...reg,
      _id: reg._id?.toString(), // Safer: use optional chaining
      registeredAt: reg.registeredAt instanceof Date ? reg.registeredAt.toISOString() : new Date(reg.registeredAt).toISOString(),
      updatedAt: reg.updatedAt && (reg.updatedAt instanceof Date ? reg.updatedAt.toISOString() : new Date(reg.updatedAt).toISOString()),
    }));
    
    return NextResponse.json(processedRegistrations);
  } catch (error) {
    console.error('Failed to fetch recent event registrations:', error);
    return NextResponse.json({ error: 'Internal Server Error. Failed to fetch recent event registrations.' }, { status: 500 });
  }
}
