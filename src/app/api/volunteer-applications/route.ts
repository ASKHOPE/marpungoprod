
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import VolunteerApplicationModel from '@/models/VolunteerApplication';
import { z } from 'zod';
import mongoose from 'mongoose';

const volunteerApplicationSchema = z.object({
  opportunityId: z.string().min(1, 'Opportunity ID is required'),
  opportunityTitle: z.string().min(1, 'Opportunity title is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  interestReason: z.string().min(10, 'Reason for interest must be at least 10 characters'),
  skills: z.string().optional(),
  availability: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const validation = volunteerApplicationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input data', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const validatedData = validation.data;
    
    const newApplicationData = {
      ...validatedData,
      // submittedAt and status will be set by default or Mongoose timestamps
    };

    const volunteerApplication = new VolunteerApplicationModel(newApplicationData);
    const savedApplication = await volunteerApplication.save();

    const responseApplication = {
        ...savedApplication.toObject(),
        _id: savedApplication._id.toString(),
    };

    return NextResponse.json(responseApplication, { status: 201 });

  } catch (error) {
    console.error('Failed to create volunteer application:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data format', details: error.flatten().fieldErrors }, { status: 400 });
    }
    if (error instanceof mongoose.Error.ValidationError) {
        return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error. Failed to create volunteer application.' }, { status: 500 });
  }
}
