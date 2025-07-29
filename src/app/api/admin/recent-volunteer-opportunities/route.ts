
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import VolunteerOpportunityModel from '@/models/VolunteerOpportunity';
// type VolunteerOpportunity from types/db not needed here

export async function GET() {
  try {
    await connectDB();
    const recentOpportunitiesData = await VolunteerOpportunityModel
      .find()
      .sort({ createdAt: -1 }) 
      .limit(5)
      .lean();
    
    const processedOpportunities = recentOpportunitiesData.map(opp => ({
      ...opp,
      _id: opp._id?.toString(), // Safer: use optional chaining
      createdAt: opp.createdAt ? new Date(opp.createdAt).toISOString() : undefined, // Consistent date format
      updatedAt: opp.updatedAt ? new Date(opp.updatedAt).toISOString() : undefined,
    }));

    return NextResponse.json(processedOpportunities);
  } catch (error) {
    console.error('Failed to fetch recent volunteer opportunities:', error);
    let message = 'Failed to fetch recent volunteer opportunities.';
    if (error instanceof Error) message = error.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
