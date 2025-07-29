
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import EventModel from '@/models/Event';
import mongoose from 'mongoose';
import { z } from 'zod';
import type { Event as EventType } from '@/types/db';

const eventUpdateSchema = z.object({
  title: z.string().min(5).optional(),
  date: z.string().min(1).optional(),
  time: z.string().min(1).optional(),
  location: z.string().min(5).optional(),
  organizer: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  fullDescription: z.string().min(20).optional(),
  image: z.string().url().or(z.literal('')).optional(),
  imageHint: z.string().max(50).optional(),
  altText: z.string().max(200).optional(),
  maxAttendees: z.number().int().min(1).optional(),
  isArchived: z.boolean().optional(),
});

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const eventObjectId = params.id;
    if (!mongoose.Types.ObjectId.isValid(eventObjectId)) {
      return NextResponse.json({ error: 'Invalid event ID format' }, { status: 400 });
    }

    const event = await EventModel.findById(eventObjectId).lean();

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    const eventWithStringId = { ...event, _id: event._id.toString() };
    return NextResponse.json(eventWithStringId);

  } catch (error) {
    console.error('Failed to fetch event:', error);
    return NextResponse.json({ error: 'Internal Server Error. Failed to fetch event.' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const eventObjectId = params.id;
    if (!mongoose.Types.ObjectId.isValid(eventObjectId)) {
      return NextResponse.json({ error: 'Invalid event ID format' }, { status: 400 });
    }

    const body = await request.json();
    const validation = eventUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input data', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const validatedData = validation.data;

    if (Object.keys(validatedData).length === 0) {
        return NextResponse.json({ error: 'No update data provided' }, { status: 400 });
    }
    
    const updateData: Partial<EventType> = { ...validatedData };
    // Mongoose timestamps will handle updatedAt

    if (validatedData.image === '') updateData.image = `https://placehold.co/1200x600.png`;
    else if (validatedData.image) updateData.image = validatedData.image;

    if (validatedData.imageHint === undefined && validatedData.title) {
      updateData.imageHint = validatedData.title.split(' ').slice(0,2).join(' ');
    } else if (validatedData.imageHint) {
      updateData.imageHint = validatedData.imageHint;
    }

    if (validatedData.altText === undefined && validatedData.title) {
       updateData.altText = `Placeholder image for ${validatedData.title}`;
    } else if (validatedData.altText) {
      updateData.altText = validatedData.altText;
    }
    
    if (validatedData.isArchived !== undefined) {
        updateData.isArchived = validatedData.isArchived;
    }

    const updatedEventDoc = await EventModel.findByIdAndUpdate(
      eventObjectId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedEventDoc) {
      return NextResponse.json({ error: 'Event not found for update' }, { status: 404 });
    }
    
    const responseEvent = {
        ...updatedEventDoc,
        _id: updatedEventDoc._id.toString(),
    };
    return NextResponse.json(responseEvent, { status: 200 });

  } catch (error) {
    console.error('Failed to update event:', error);
     if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data format', details: error.errors }, { status: 400 });
    }
     if (error instanceof mongoose.Error.ValidationError) {
        return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error. Failed to update event.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const eventObjectId = params.id;
    if (!mongoose.Types.ObjectId.isValid(eventObjectId)) {
      return NextResponse.json({ error: 'Invalid event ID format' }, { status: 400 });
    }

    const result = await EventModel.findByIdAndDelete(eventObjectId);

    if (!result) {
      return NextResponse.json({ error: 'Event not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Event deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Failed to delete event:', error);
    return NextResponse.json({ error: 'Internal Server Error. Failed to delete event.' }, { status: 500 });
  }
}
