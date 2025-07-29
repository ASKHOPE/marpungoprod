
import { NextResponse, type NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import UserModel from '@/models/User';
import mongoose from 'mongoose';
import { z } from 'zod';
import { getToken } from 'next-auth/jwt';

// Schema for updating user, password is not included for admin updates
const userUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  role: z.enum(['admin', 'user']).optional(),
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const userId = params.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }

    const user = await UserModel.findById(userId).select('-password').lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const userWithStringId = { 
      ...user, 
      _id: user._id.toString(),
      createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : undefined,
      updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString() : undefined,
    };
    return NextResponse.json(userWithStringId);

  } catch (error) {
    console.error('Failed to fetch user for admin edit:', error);
    return NextResponse.json({ error: 'Internal Server Error. Failed to fetch user.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const userIdToUpdate = params.id;

    if (!mongoose.Types.ObjectId.isValid(userIdToUpdate)) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }

    const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
    if (!token || token.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const currentAdminId = token.id as string;


    const body = await request.json();
    const validation = userUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input data for updating user', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const updateData = validation.data;

    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ error: 'No update data provided' }, { status: 400 });
    }

    // Prevent admin from changing their own role if they are the only admin or to a non-admin role
    if (userIdToUpdate === currentAdminId && updateData.role && updateData.role !== 'admin') {
        const adminCount = await UserModel.countDocuments({ role: 'admin' });
        if (adminCount <= 1) {
            return NextResponse.json({ error: 'Cannot change the role of the only admin account.' }, { status: 403 });
        }
    }
    
    // Check for email uniqueness if email is being changed
    if (updateData.email) {
        const existingUserWithEmail = await UserModel.findOne({ email: updateData.email, _id: { $ne: userIdToUpdate } });
        if (existingUserWithEmail) {
            return NextResponse.json({ error: 'Email already in use by another account.' }, { status: 409 });
        }
    }

    const updatedUserDoc = await UserModel.findByIdAndUpdate(
      userIdToUpdate,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password').lean();

    if (!updatedUserDoc) {
      return NextResponse.json({ error: 'User not found for update' }, { status: 404 });
    }
    
    const responseUser = {
        ...updatedUserDoc,
        _id: updatedUserDoc._id.toString(),
    };
    return NextResponse.json(responseUser, { status: 200 });

  } catch (error) {
    console.error('Failed to update user:', error);
     if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data format', details: error.errors }, { status: 400 });
    }
     if (error instanceof mongoose.Error.ValidationError) {
        return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error. Failed to update user.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const userIdToDelete = params.id;

    if (!mongoose.Types.ObjectId.isValid(userIdToDelete)) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }

    const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
    if (!token || token.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentAdminId = token.id as string;

    if (userIdToDelete === currentAdminId) {
      return NextResponse.json({ error: 'Admins cannot delete their own account.' }, { status: 403 });
    }

    const result = await UserModel.findByIdAndDelete(userIdToDelete);

    if (!result) {
      return NextResponse.json({ error: 'User not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json({ error: 'Internal Server Error. Failed to delete user.' }, { status: 500 });
  }
}
