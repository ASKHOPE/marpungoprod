
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import VolunteerOpportunityModel from '@/models/VolunteerOpportunity';
// type VolunteerOpportunity not strictly needed

export async function GET() {
  try {
    await connectDB();
    const opportunitiesData = await VolunteerOpportunityModel
      .find()
      .sort({ createdAt: -1 }) 
      .lean();

    const processedOpportunities = opportunitiesData.map(opp => ({
      ...opp,
      _id: opp._id.toString(),
    }));

    return NextResponse.json(processedOpportunities);
  } catch (error) {
    console.error('Failed to fetch all volunteer opportunities for admin manage page:', error);
    let message = 'Failed to fetch all volunteer opportunities.';
    if (error instanceof Error) message = error.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
