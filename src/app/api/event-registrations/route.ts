
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import EventRegistrationModel from '@/models/EventRegistration';
import { z } from 'zod';

const eventRegistrationSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  eventTitle: z.string().min(1, 'Event title is required'),
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  attendees: z.coerce.number().int().min(1, 'Number of attendees must be at least 1'),
});

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const validation = eventRegistrationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input data', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const validatedData = validation.data;
    
    const newRegistrationData = {
      ...validatedData,
      // registeredAt will be set by default or Mongoose timestamps
    };

    const eventRegistration = new EventRegistrationModel(newRegistrationData);
    const savedRegistration = await eventRegistration.save();
    
    const responseRegistration = {
        ...savedRegistration.toObject(),
        _id: savedRegistration._id.toString(),
    };

    return NextResponse.json(responseRegistration, { status: 201 });

  } catch (error) {
    console.error('Failed to create event registration:', error);
    if (error instanceof z.ZodError) { // Should be caught by safeParse, but good practice
      return NextResponse.json({ error: 'Invalid data format', details: error.flatten().fieldErrors }, { status: 400 });
    }
    if (error instanceof mongoose.Error.ValidationError) {
        return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error. Failed to create event registration.' }, { status: 500 });
  }
}
