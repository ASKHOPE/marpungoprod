
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import EventModel from '@/models/Event';
import VolunteerOpportunityModel from '@/models/VolunteerOpportunity';
import ContactMessageModel from '@/models/ContactMessage';
import EventRegistrationModel from '@/models/EventRegistration';
import VolunteerApplicationModel from '@/models/VolunteerApplication';
import ProjectModel from '@/models/Project';
import UserModel from '@/models/User'; // Import User model

export async function GET() {
  try {
    await connectDB();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const activeEventsQuery = { isArchived: { $ne: true } };
    
    const totalEvents = await EventModel.countDocuments(activeEventsQuery);
    const upcomingEvents = await EventModel.countDocuments({ 
      ...activeEventsQuery, 
      date: { $gte: startOfToday.toISOString() } 
    });
    const pastEvents = await EventModel.countDocuments({ 
      ...activeEventsQuery, 
      date: { $lt: startOfToday.toISOString() } 
    });
    const archivedEvents = await EventModel.countDocuments({ isArchived: true });

    const totalOpportunities = await VolunteerOpportunityModel.countDocuments();
    
    const totalMessages = await ContactMessageModel.countDocuments({ status: 'active' });
    const unreadMessages = await ContactMessageModel.countDocuments({ isRead: { $ne: true }, status: 'active' });
    const archivedMessages = await ContactMessageModel.countDocuments({ status: 'archived' });
    const spamMessages = await ContactMessageModel.countDocuments({ status: 'spam' });

    const totalRegistrations = await EventRegistrationModel.countDocuments();
    
    const totalApplications = await VolunteerApplicationModel.countDocuments();
    const pendingApplications = await VolunteerApplicationModel.countDocuments({ status: 'pending' });
    const acceptedApplications = await VolunteerApplicationModel.countDocuments({ status: 'accepted' });
    const reviewedApplications = await VolunteerApplicationModel.countDocuments({ status: 'reviewed' });
    const rejectedApplications = await VolunteerApplicationModel.countDocuments({ status: 'rejected' });

    const totalProjects = await ProjectModel.countDocuments();
    const activeProjects = await ProjectModel.countDocuments({ status: 'active' });
    const fundedProjects = await ProjectModel.countDocuments({ status: 'funded' });
    const archivedProjects = await ProjectModel.countDocuments({ status: 'archived' });

    const totalUsers = await UserModel.countDocuments(); // Add user count

    return NextResponse.json({
      totalEvents,
      upcomingEvents,
      pastEvents,
      archivedEvents,
      totalOpportunities,
      totalMessages,
      unreadMessages,
      archivedMessages,
      spamMessages,
      totalRegistrations,
      totalApplications,
      pendingApplications,
      acceptedApplications,
      reviewedApplications,
      rejectedApplications,
      totalProjects,
      activeProjects,
      fundedProjects,
      archivedProjects,
      totalUsers, // Include totalUsers in the response
    });
  } catch (error) {
    console.error('Failed to fetch admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch admin statistics. Please try again later.' }, { status: 500 });
  }
}
