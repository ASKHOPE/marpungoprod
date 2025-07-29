
import type { ObjectId } from 'mongodb';
import type { User as NextAuthUser } from 'next-auth'; // For session user typing

export interface Event {
  _id?: ObjectId;
  id: string; // slug or custom ID
  title: string;
  date: string; // Consider ISO string for proper date handling, or keep as display string
  time: string;
  location: string;
  organizer: string;
  description: string;
  fullDescription: string;
  image: string;
  imageHint: string;
  altText: string;
  maxAttendees?: number;
  isArchived?: boolean; 
  createdAt: Date;
  updatedAt: Date;
}

export interface VolunteerOpportunity {
  _id?: ObjectId;
  id: string; // slug or custom ID
  title: string;
  commitment: string;
  location: string;
  skills: string;
  description: string;
  image: string;
  imageHint: string;
  altText: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactMessage {
  _id?: ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: Date;
  isRead?: boolean;
  status?: 'active' | 'archived' | 'spam'; 
  updatedAt?: Date; 
}

export interface EventRegistration {
  _id?: ObjectId;
  eventId: string; // Corresponds to Event.id
  eventTitle: string; // Denormalized for easier display
  fullName: string;
  email: string;
  attendees: number;
  registeredAt: Date;
}

export interface VolunteerApplication {
  _id?: ObjectId;
  opportunityId: string; // Corresponds to VolunteerOpportunity.id
  opportunityTitle: string; // Denormalized
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  interestReason: string;
  skills?: string;
  availability?: string; // Added from apply form
  submittedAt: Date;
  status?: 'pending' | 'reviewed' | 'accepted' | 'rejected'; 
  notes?: string; // For admin notes
  updatedAt?: Date; 
}

export interface Project {
  _id?: ObjectId;
  slug: string; // Unique identifier for URL and linking
  title: string;
  description: string;
  longDescription?: string;
  image: string;
  imageHint: string;
  altText: string;
  goalAmount: number;
  currentAmount: number;
  status: 'active' | 'funded' | 'archived'; // To control visibility and status
  startDate?: Date;
  endDate?: Date;
  stripeProductId?: string; // ID of the Stripe Product
  stripePriceId?: string; // ID of the Stripe Price (for custom amount)
  stripePaymentLinkUrl?: string; // URL for Stripe Payment Link
  createdAt: Date;
  updatedAt: Date;
}

// For NextAuth User model stored in MongoDB
export interface UserDocument {
  _id: ObjectId; // Mongoose uses ObjectId by default
  email: string;
  password?: string; // Password might not always be present (e.g., OAuth)
  name: string;
  phone?: string;
  image?: string; // URL to profile image
  role: 'admin' | 'user'; // Added role
  createdAt: Date;
  updatedAt: Date;
}

// Extend NextAuth User type for session/JWT
declare module 'next-auth' {
  interface Session {
    user?: NextAuthUser & {
      id?: string | null;
      role?: string | null; // Add role to session user
    };
  }
  interface User extends NextAuthUser {
     id?: string | null; 
     role?: string | null; // Add role to user object from authorize
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    name?: string | null;
    email?: string | null;
    picture?: string | null;
    role?: string | null; // Add role to JWT
  }
}
