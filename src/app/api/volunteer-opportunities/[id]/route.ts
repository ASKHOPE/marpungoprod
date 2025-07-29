
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import VolunteerOpportunityModel from '@/models/VolunteerOpportunity';
// type VolunteerOpportunity is not needed here

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const opportunitySlug = params.id;
    if (!opportunitySlug) {
      return NextResponse.json({ error: 'Opportunity ID (slug) is required' }, { status: 400 });
    }

    const opportunity = await VolunteerOpportunityModel.findOne({ id: opportunitySlug }).lean();

    if (!opportunity) {
      return NextResponse.json({ error: 'Volunteer opportunity not found' }, { status: 404 });
    }
    
    const opportunityWithStringId = { ...opportunity, _id: opportunity._id.toString() };
    return NextResponse.json(opportunityWithStringId);

  } catch (error) {
    console.error('Failed to fetch volunteer opportunity by slug:', error);
    let message = 'Internal Server Error. Failed to fetch opportunity.';
    if (error instanceof Error) message = error.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
