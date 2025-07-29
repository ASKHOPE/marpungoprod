
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ContactMessageModel from '@/models/ContactMessage';
import { ObjectId } from 'mongodb'; // Keep for ID validation
import mongoose from 'mongoose';
import { z } from 'zod';
// ContactMessage type from types/db is not strictly needed if relying on Mongoose Document types

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const messageId = params.id;
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return NextResponse.json({ error: 'Invalid message ID format' }, { status: 400 });
    }

    const message = await ContactMessageModel.findById(messageId).lean();

    if (!message) {
      return NextResponse.json({ error: 'Contact message not found' }, { status: 404 });
    }
    
    const messageWithStringId = { 
      ...message, 
      _id: message._id.toString(),
      submittedAt: message.submittedAt instanceof Date ? message.submittedAt.toISOString() : message.submittedAt,
      updatedAt: message.updatedAt && (message.updatedAt instanceof Date ? message.updatedAt.toISOString() : message.updatedAt),
      createdAt: message.createdAt && (message.createdAt instanceof Date ? message.createdAt.toISOString() : message.createdAt),
      isRead: message.isRead || false, 
      status: message.status || 'active',
    };
    return NextResponse.json(messageWithStringId);

  } catch (error) {
    console.error('Failed to fetch contact message:', error);
    return NextResponse.json({ error: 'Internal Server Error. Failed to fetch contact message.' }, { status: 500 });
  }
}

const updateMessageSchema = z.object({
  isRead: z.boolean().optional(),
  status: z.enum(['active', 'archived', 'spam']).optional(),
});

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const messageId = params.id;
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return NextResponse.json({ error: 'Invalid message ID format' }, { status: 400 });
    }

    const body = await request.json();
    const validation = updateMessageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input data for updating message', details: validation.error.errors }, { status: 400 });
    }

    const { isRead, status } = validation.data;
    
    const updateFields: Partial<import('@/types/db').ContactMessage> = {}; // Use type for safety
    if (isRead !== undefined) {
      updateFields.isRead = isRead;
    }
    if (status) {
      updateFields.status = status;
    }

    if (Object.keys(updateFields).length === 0) {
        return NextResponse.json({ error: 'No update data provided' }, { status: 400 });
    }
    // Mongoose's findByIdAndUpdate will automatically handle updatedAt if timestamps:true is in schema
    const updatedMessageDoc = await ContactMessageModel.findByIdAndUpdate(
      messageId,
      { $set: updateFields },
      { new: true, runValidators: true } // new: true returns the updated document
    ).lean();

    if (!updatedMessageDoc) {
      return NextResponse.json({ error: 'Contact message not found for update' }, { status: 404 });
    }
    
    const responseMessage = {
        ...updatedMessageDoc,
        _id: updatedMessageDoc._id.toString(),
        submittedAt: updatedMessageDoc.submittedAt instanceof Date ? updatedMessageDoc.submittedAt.toISOString() : updatedMessageDoc.submittedAt,
        updatedAt: updatedMessageDoc.updatedAt && (updatedMessageDoc.updatedAt instanceof Date ? updatedMessageDoc.updatedAt.toISOString() : updatedMessageDoc.updatedAt),
        createdAt: updatedMessageDoc.createdAt && (updatedMessageDoc.createdAt instanceof Date ? updatedMessageDoc.createdAt.toISOString() : updatedMessageDoc.createdAt),
        isRead: updatedMessageDoc.isRead || false,
        status: updatedMessageDoc.status || 'active',
    };

    return NextResponse.json({ 
        message: 'Message updated successfully', 
        updatedMessage: responseMessage
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to update contact message:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data format', details: error.errors }, { status: 400 });
    }
    if (error instanceof mongoose.Error.ValidationError) {
        return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error. Failed to update message.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const messageId = params.id;
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return NextResponse.json({ error: 'Invalid message ID format' }, { status: 400 });
    }

    const result = await ContactMessageModel.findByIdAndDelete(messageId);

    if (!result) {
      return NextResponse.json({ error: 'Contact message not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Contact message deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Failed to delete contact message:', error);
    return NextResponse.json({ error: 'Internal Server Error. Failed to delete contact message.' }, { status: 500 });
  }
}
