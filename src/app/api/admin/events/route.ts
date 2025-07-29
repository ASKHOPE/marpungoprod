
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import EventModel from '@/models/Event';
import { z } from 'zod';
import type { Event as EventType } from '@/types/db';
import mongoose from 'mongoose';

const eventSchema = z.object({
  id: z.string().min(3).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(5),
  date: z.string().min(1),
  time: z.string().min(1),
  location: z.string().min(5),
  organizer: z.string().min(3),
  description: z.string().min(10),
  fullDescription: z.string().min(20),
  image: z.string().url().or(z.literal('')).optional(),
  imageHint: z.string().max(50).optional(),
  altText: z.string().max(200).optional(),
  maxAttendees: z.number().int().min(1).optional(),
  isArchived: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const validation = eventSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input data', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const validatedData = validation.data;

    const existingEventById = await EventModel.findOne({ id: validatedData.id });
    if (existingEventById) {
      return NextResponse.json({ error: `Event with ID/slug '${validatedData.id}' already exists.` }, { status: 409 });
    }
    
    const newEventData: Omit<EventType, '_id' | 'createdAt' | 'updatedAt'> = {
      ...validatedData,
      image: validatedData.image || `https://placehold.co/1200x600.png`,
      imageHint: validatedData.imageHint || (validatedData.title.split(' ').slice(0,2).join(' ') || 'event placeholder'),
      altText: validatedData.altText || `Placeholder image for ${validatedData.title}`,
      isArchived: validatedData.isArchived || false,
    };

    const eventToSave = new EventModel(newEventData);
    const savedEvent = await eventToSave.save();
    
    const responseEvent = {
        ...savedEvent.toObject(),
        _id: savedEvent._id.toString(),
    };

    return NextResponse.json(responseEvent, { status: 201 });

  } catch (error) {
    console.error('Failed to create event:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data format', details: error.flatten().fieldErrors }, { status: 400 });
    }
    if (error instanceof mongoose.Error.ValidationError) {
        return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error. Failed to create event.' }, { status: 500 });
  }
}
