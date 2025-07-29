
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import VolunteerOpportunityModel from '@/models/VolunteerOpportunity';
// type VolunteerOpportunity is not needed if relying on Mongoose Document types for return

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
    console.error('Failed to fetch volunteer opportunities:', error);
    let message = 'Failed to fetch volunteer opportunities.';
    if (error instanceof Error) message = error.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
