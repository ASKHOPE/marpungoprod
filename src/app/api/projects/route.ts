
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ProjectModel from '@/models/Project';
// type Project from types/db not strictly needed here for GET all

export async function GET() {
  try {
    await connectDB();
    // Fetch only active projects, sort by creation date or a specific order field if available
    const activeProjectsData = await ProjectModel
      .find({ status: 'active' })
      .sort({ createdAt: -1 }) // Example: newest first
      .lean();

    const processedProjects = activeProjectsData.map(project => ({
      ...project,
      _id: project._id.toString(),
      startDate: project.startDate ? project.startDate.toISOString() : undefined,
      endDate: project.endDate ? project.endDate.toISOString() : undefined,
    }));

    return NextResponse.json(processedProjects);
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json({ error: 'Internal Server Error. Failed to fetch projects.' }, { status: 500 });
  }
}
