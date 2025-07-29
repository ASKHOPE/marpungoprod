
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ContactMessageModel from '@/models/ContactMessage';
// ContactMessage type from types/db is not strictly needed here if we rely on Mongoose Document types

export async function GET() {
  try {
    await connectDB();

    const recentMessagesData = await ContactMessageModel
      .find() // No specific filter here, shows latest 5 regardless of status for "recent"
      .sort({ submittedAt: -1 })
      .limit(5)
      .lean(); // Use .lean() for plain JS objects

    const processedMessages = recentMessagesData.map(msg => ({
      ...msg,
      _id: msg._id?.toString(), // Safer: use optional chaining
      // Ensure dates are ISO strings for consistency if they need re-parsing on client
      submittedAt: msg.submittedAt instanceof Date ? msg.submittedAt.toISOString() : new Date(msg.submittedAt).toISOString(),
      updatedAt: msg.updatedAt && (msg.updatedAt instanceof Date ? msg.updatedAt.toISOString() : new Date(msg.updatedAt).toISOString()),
      createdAt: msg.createdAt && (msg.createdAt instanceof Date ? msg.createdAt.toISOString() : new Date(msg.createdAt).toISOString()),
      // isRead and status should be present from lean() due to schema defaults
    }));
    
    return NextResponse.json(processedMessages);
  } catch (error) {
    console.error('Failed to fetch recent contact messages:', error);
    return NextResponse.json({ error: 'Internal Server Error. Failed to fetch recent contact messages.' }, { status: 500 });
  }
}
