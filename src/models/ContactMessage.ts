
import mongoose, { Schema, model, Document } from "mongoose";
import type { ContactMessage as IContactMessage } from "@/types/db";

export interface ContactMessageDocument extends IContactMessage, Document {}

const ContactMessageSchema = new Schema<ContactMessageDocument>({
  firstName: {
    type: String,
    required: [true, "First name is required"],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  subject: {
    type: String,
    required: [true, "Subject is required"],
    trim: true,
  },
  message: {
    type: String,
    required: [true, "Message is required"],
    trim: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'spam'],
    default: 'active',
  },
},
{
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'contact_messages', // Explicitly set collection name
});

const ContactMessageModel = mongoose.models.ContactMessage || model<ContactMessageDocument>('ContactMessage', ContactMessageSchema);

export default ContactMessageModel;
