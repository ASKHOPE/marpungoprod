
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import VolunteerApplicationModel from '@/models/VolunteerApplication';
import mongoose from 'mongoose';
import { z } from 'zod';
import type { VolunteerApplication } from '@/types/db'; // For status enum consistency

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const applicationId = params.id;
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return NextResponse.json({ error: 'Invalid application ID format' }, { status: 400 });
    }

    const application = await VolunteerApplicationModel.findById(applicationId).lean();

    if (!application) {
      return NextResponse.json({ error: 'Volunteer application not found' }, { status: 404 });
    }
    
    const applicationWithStringId = { 
      ...application, 
      _id: application._id.toString(),
      submittedAt: application.submittedAt instanceof Date ? application.submittedAt.toISOString() : application.submittedAt,
      updatedAt: application.updatedAt && (application.updatedAt instanceof Date ? application.updatedAt.toISOString() : application.updatedAt),
      status: application.status || 'pending',
    };
    return NextResponse.json(applicationWithStringId);

  } catch (error) {
    console.error('Failed to fetch volunteer application:', error);
    return NextResponse.json({ error: 'Internal Server Error. Failed to fetch application.' }, { status: 500 });
  }
}

const updateApplicationSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'accepted', 'rejected'] as [VolunteerApplication['status'], ...VolunteerApplication['status'][]]).optional(),
  notes: z.string().optional(),
});

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const applicationId = params.id;
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return NextResponse.json({ error: 'Invalid application ID format' }, { status: 400 });
    }

    const body = await request.json();
    const validation = updateApplicationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input data for updating application', details: validation.error.errors }, { status: 400 });
    }

    const { status, notes } = validation.data;
    
    const updateFields: Partial<import('@/models/VolunteerApplication').VolunteerApplicationDocument> = {};
    if (status) {
      updateFields.status = status;
    }
    if (notes !== undefined) { 
      updateFields.notes = notes;
    }

    if (Object.keys(updateFields).length === 0) { 
        return NextResponse.json({ error: 'No update data provided' }, { status: 400 });
    }
    // Mongoose's findByIdAndUpdate will automatically handle updatedAt due to schema timestamps:true
    const updatedApplicationDoc = await VolunteerApplicationModel.findByIdAndUpdate(
      applicationId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedApplicationDoc) {
      return NextResponse.json({ error: 'Volunteer application not found for update' }, { status: 404 });
    }
    
    const responseApplication = {
        ...updatedApplicationDoc,
        _id: updatedApplicationDoc._id.toString(),
        submittedAt: updatedApplicationDoc.submittedAt instanceof Date ? updatedApplicationDoc.submittedAt.toISOString() : updatedApplicationDoc.submittedAt,
        updatedAt: updatedApplicationDoc.updatedAt && (updatedApplicationDoc.updatedAt instanceof Date ? updatedApplicationDoc.updatedAt.toISOString() : updatedApplicationDoc.updatedAt),
        status: updatedApplicationDoc.status || 'pending',
        notes: updatedApplicationDoc.notes || '' 
    };

    return NextResponse.json({ 
        message: 'Application updated successfully', 
        updatedApplication: responseApplication
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to update volunteer application:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data format', details: error.errors }, { status: 400 });
    }
     if (error instanceof mongoose.Error.ValidationError) {
        return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error. Failed to update application.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const applicationId = params.id;
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return NextResponse.json({ error: 'Invalid application ID format' }, { status: 400 });
    }

    const result = await VolunteerApplicationModel.findByIdAndDelete(applicationId);

    if (!result) {
      return NextResponse.json({ error: 'Volunteer application not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Volunteer application deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Failed to delete volunteer application:', error);
    return NextResponse.json({ error: 'Internal Server Error. Failed to delete application.' }, { status: 500 });
  }
}
