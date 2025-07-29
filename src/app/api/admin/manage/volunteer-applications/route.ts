
import { NextResponse, type NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import VolunteerApplicationModel from '@/models/VolunteerApplication';
import type { VolunteerApplication } from '@/types/db'; // For status type consistency

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') as VolunteerApplication['status'] | 'all';

    let query: mongoose.FilterQuery<import('@/models/VolunteerApplication').VolunteerApplicationDocument> = {};
    
    const validStatuses: VolunteerApplication['status'][] = ['pending', 'reviewed', 'accepted', 'rejected'];
    if (filter && filter !== 'all' && validStatuses.includes(filter)) {
      query = { status: filter };
    } else if (filter === 'all') {
      query = {};
    } else if (filter) { // Invalid filter value
        return NextResponse.json({ error: `Invalid filter value: ${filter}. Valid filters are 'all', 'pending', 'reviewed', 'accepted', 'rejected'.` }, { status: 400 });
    }
    // If no filter, default to all (empty query)

    const allApplicationsData = await VolunteerApplicationModel
      .find(query)
      .sort({ submittedAt: -1 }) 
      .lean();

    const processedApplications = allApplicationsData.map(app => ({
      ...app,
      _id: app._id?.toString(),
      submittedAt: app.submittedAt instanceof Date ? app.submittedAt.toISOString() : app.submittedAt,
      updatedAt: app.updatedAt && (app.updatedAt instanceof Date ? app.updatedAt.toISOString() : app.updatedAt),
      status: app.status || 'pending', 
    }));

    return NextResponse.json(processedApplications);
  } catch (error) {
    console.error('Failed to fetch all volunteer applications for admin:', error);
    return NextResponse.json({ error: 'Internal Server Error. Failed to fetch volunteer applications.' }, { status: 500 });
  }
}
