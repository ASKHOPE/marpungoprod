
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import VolunteerOpportunityModel from '@/models/VolunteerOpportunity';
import { z } from 'zod';
// type VolunteerOpportunity from types/db not needed here

const volunteerOpportunitySchema = z.object({
  id: z.string().min(3).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(5),
  commitment: z.string().min(3),
  location: z.string().min(5),
  skills: z.string().min(5),
  description: z.string().min(10),
  image: z.string().url().or(z.literal('')).optional(),
  imageHint: z.string().max(50).optional(),
  altText: z.string().max(200).optional(),
});

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const validation = volunteerOpportunitySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input data', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const validatedData = validation.data;

    const existingOpportunityById = await VolunteerOpportunityModel.findOne({ id: validatedData.id });
    if (existingOpportunityById) {
      return NextResponse.json({ error: `Volunteer opportunity with ID/slug '${validatedData.id}' already exists.` }, { status: 409 });
    }
    
    const newOpportunityData = {
      ...validatedData,
      image: validatedData.image || `https://placehold.co/600x400.png`,
      imageHint: validatedData.imageHint || (validatedData.title.split(' ').slice(0,2).join(' ') || 'volunteer opportunity'),
      altText: validatedData.altText || `Placeholder image for ${validatedData.title}`,
      // createdAt and updatedAt are handled by Mongoose timestamps
    };

    const volunteerOpportunity = new VolunteerOpportunityModel(newOpportunityData);
    const savedOpportunity = await volunteerOpportunity.save();
    
    const responseOpportunity = {
        ...savedOpportunity.toObject(),
        _id: savedOpportunity._id.toString(),
    };

    return NextResponse.json(responseOpportunity, { status: 201 });

  } catch (error) {
    console.error('Failed to create volunteer opportunity:', error);
    let message = 'Internal Server Error. Failed to create volunteer opportunity.';
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data format', details: error.flatten().fieldErrors }, { status: 400 });
    }
    if (error instanceof Error) message = error.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
