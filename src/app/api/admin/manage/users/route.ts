
import { NextResponse, type NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import UserModel from '@/models/User';
import type { UserDocument } from '@/models/User'; // Mongoose document type

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Exclude password from the returned user data
    const users = await UserModel.find().select('-password').lean();

    const processedUsers = users.map(user => ({
      ...user,
      _id: user._id.toString(),
      createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : undefined,
      updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString() : undefined,
    }));

    return NextResponse.json(processedUsers);
  } catch (error) {
    console.error('Failed to fetch users for admin:', error);
    return NextResponse.json({ error: 'Internal Server Error. Failed to fetch users.' }, { status: 500 });
  }
}
