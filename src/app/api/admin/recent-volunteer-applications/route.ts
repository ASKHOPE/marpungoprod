
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import VolunteerApplicationModel from '@/models/VolunteerApplication';
// type VolunteerApplication not strictly needed here

export async function GET() {
  try {
    await connectDB();
    const recentApplicationsData = await VolunteerApplicationModel
      .find() // No specific filter here, shows latest 5 for "recent"
      .sort({ submittedAt: -1 })
      .limit(5)
      .lean();
    
    const processedApplications = recentApplicationsData.map(app => ({
      ...app,
      _id: app._id?.toString(), // Safer: use optional chaining
      submittedAt: app.submittedAt instanceof Date ? app.submittedAt.toISOString() : new Date(app.submittedAt).toISOString(),
      updatedAt: app.updatedAt && (app.updatedAt instanceof Date ? app.updatedAt.toISOString() : new Date(app.updatedAt).toISOString()),
      // status should be present from lean() due to schema default 'pending'
    }));

    return NextResponse.json(processedApplications);
  } catch (error)
{
    console.error('Failed to fetch recent volunteer applications:', error);
    return NextResponse.json({ error: 'Internal Server Error. Failed to fetch recent volunteer applications.' }, { status: 500 });
  }
}
