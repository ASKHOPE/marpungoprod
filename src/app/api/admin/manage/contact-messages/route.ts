
import { NextResponse, type NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ContactMessageModel from '@/models/ContactMessage';
import type { ContactMessage } from '@/types/db'; // Keep for status type consistency

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') as ContactMessage['status'] | 'all' | 'read' | 'unread';

    let query: mongoose.FilterQuery<import('@/models/ContactMessage').ContactMessageDocument> = {};
    
    if (filter === 'read') {
      query = { isRead: true, status: 'active' };
    } else if (filter === 'unread') {
      query = { isRead: { $ne: true }, status: 'active' };
    } else if (filter === 'archived') {
      query = { status: 'archived' };
    } else if (filter === 'spam') {
      query = { status: 'spam' };
    } else if (filter === 'all') {
      // No additional query, fetch all regardless of status
      query = {};
    }
    // If filter is unrecognized, it also defaults to query = {} (all)

    const allMessagesData = await ContactMessageModel
      .find(query)
      .sort({ submittedAt: -1 }) 
      .lean();

    const processedMessages = allMessagesData.map(msg => ({
      ...msg,
      _id: msg._id?.toString(),
      submittedAt: msg.submittedAt instanceof Date ? msg.submittedAt.toISOString() : msg.submittedAt,
      updatedAt: msg.updatedAt && (msg.updatedAt instanceof Date ? msg.updatedAt.toISOString() : msg.updatedAt),
      createdAt: msg.createdAt && (msg.createdAt instanceof Date ? msg.createdAt.toISOString() : msg.createdAt),
      isRead: msg.isRead || false, 
      status: msg.status || 'active',
    }));

    return NextResponse.json(processedMessages);
  } catch (error) {
    console.error('Failed to fetch all contact messages for admin:', error);
    return NextResponse.json({ error: 'Internal Server Error. Failed to fetch contact messages.' }, { status: 500 });
  }
}
