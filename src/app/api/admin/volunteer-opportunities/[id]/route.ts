
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import VolunteerOpportunityModel from '@/models/VolunteerOpportunity';
import { ObjectId } from 'mongodb'; // For validating MongoDB ObjectId string
import mongoose from 'mongoose';
import { z } from 'zod';
// type VolunteerOpportunity from types/db not strictly needed

const opportunityUpdateSchema = z.object({
  title: z.string().min(5).optional(),
  commitment: z.string().min(3).optional(),
  location: z.string().min(5).optional(),
  skills: z.string().min(5).optional(),
  description: z.string().min(10).optional(),
  image: z.string().url().or(z.literal('')).optional(),
  imageHint: z.string().max(50).optional(),
  altText: z.string().max(200).optional(),
});


export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const opportunityObjectId = params.id;
    if (!mongoose.Types.ObjectId.isValid(opportunityObjectId)) {
      return NextResponse.json({ error: 'Invalid opportunity Object ID format' }, { status: 400 });
    }

    const opportunity = await VolunteerOpportunityModel.findById(opportunityObjectId).lean();

    if (!opportunity) {
      return NextResponse.json({ error: 'Volunteer opportunity not found' }, { status: 404 });
    }
    
    const opportunityWithStringId = { ...opportunity, _id: opportunity._id.toString() };
    return NextResponse.json(opportunityWithStringId);

  } catch (error) {
    console.error('Failed to fetch volunteer opportunity by ObjectId:', error);
    let message = 'Internal Server Error. Failed to fetch volunteer opportunity.';
    if (error instanceof Error) message = error.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const opportunityObjectId = params.id;
    if (!mongoose.Types.ObjectId.isValid(opportunityObjectId)) {
      return NextResponse.json({ error: 'Invalid opportunity Object ID format' }, { status: 400 });
    }

    const body = await request.json();
    const validation = opportunityUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input data', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const validatedData = validation.data;

    if (Object.keys(validatedData).length === 0) {
        return NextResponse.json({ error: 'No update data provided' }, { status: 400 });
    }
    
    const updateFields: any = { ...validatedData };
    // Mongoose's findByIdAndUpdate will automatically update `updatedAt` due to schema timestamps:true

    if (validatedData.image === '') updateFields.image = `https://placehold.co/600x400.png`;
    
    if (validatedData.imageHint === undefined && validatedData.title) {
      updateFields.imageHint = validatedData.title.split(' ').slice(0,2).join(' ');
    }

    if (validatedData.altText === undefined && validatedData.title) {
       updateFields.altText = `Placeholder image for ${validatedData.title}`;
    }

    const updatedOpportunityDoc = await VolunteerOpportunityModel.findByIdAndUpdate(
      opportunityObjectId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedOpportunityDoc) {
      return NextResponse.json({ error: 'Volunteer opportunity not found for update' }, { status: 404 });
    }
    
    const responseOpportunity = {
        ...updatedOpportunityDoc,
        _id: updatedOpportunityDoc._id.toString(),
    };

    return NextResponse.json(responseOpportunity, { status: 200 });

  } catch (error) {
    console.error('Failed to update volunteer opportunity:', error);
    let message = 'Internal Server Error. Failed to update volunteer opportunity.';
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data format', details: error.flatten().fieldErrors }, { status: 400 });
    }
    if (error instanceof mongoose.Error.ValidationError) {
        return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    if (error instanceof Error) message = error.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const opportunityObjectId = params.id;
    if (!mongoose.Types.ObjectId.isValid(opportunityObjectId)) {
      return NextResponse.json({ error: 'Invalid opportunity Object ID format' }, { status: 400 });
    }

    const result = await VolunteerOpportunityModel.findByIdAndDelete(opportunityObjectId);

    if (!result) {
      return NextResponse.json({ error: 'Volunteer opportunity not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Volunteer opportunity deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Failed to delete volunteer opportunity:', error);
    let message = 'Internal Server Error. Failed to delete volunteer opportunity.';
    if (error instanceof Error) message = error.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
