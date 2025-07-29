
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ContactMessageModel from '@/models/ContactMessage';
import { z } from 'zod';
import type { ContactMessage } from '@/types/db'; // Assuming this type might not be needed if we use the model directly

const contactSubmissionSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters long'),
});

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const validation = contactSubmissionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input data', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { firstName, lastName, email, subject, message } = validation.data;
    
    const newContactMessageData = {
      firstName,
      lastName,
      email,
      subject,
      message,
      submittedAt: new Date(), // Mongoose default might override this, but good to be explicit
      isRead: false,
      status: 'active',
    };

    const contactMessage = new ContactMessageModel(newContactMessageData);
    const savedMessage = await contactMessage.save();
    
    // Convert ObjectId to string for the response
    const responseMessage = {
        ...savedMessage.toObject(),
        _id: savedMessage._id.toString(),
    };

    return NextResponse.json({ message: 'Message sent successfully!', data: responseMessage }, { status: 201 });

  } catch (error) {
    console.error('Failed to process contact submission:', error);
    if (error instanceof z.ZodError) { // Should be caught by safeParse, but good practice
      return NextResponse.json({ error: 'Invalid data format', details: error.flatten().fieldErrors }, { status: 400 });
    }
    if (error instanceof mongoose.Error.ValidationError) {
        return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error. Failed to process contact submission.' }, { status: 500 });
  }
}
