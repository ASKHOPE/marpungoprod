
import mongoose, { Schema, model, Document } from "mongoose";
import type { EventRegistration as IEventRegistration } from "@/types/db";

export interface EventRegistrationDocument extends IEventRegistration, Document {}

const EventRegistrationSchema = new Schema<EventRegistrationDocument>({
  eventId: {
    type: String, // Corresponds to Event.id (slug)
    required: true,
  },
  eventTitle: { // Denormalized for convenience
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  attendees: {
    type: Number,
    required: true,
    min: 1,
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
},
{
  timestamps: { createdAt: 'registeredAt', updatedAt: 'updatedAt' }, // Use registeredAt as createdAt
  collection: 'event_registrations', // Explicitly set collection name
});

const EventRegistrationModel = mongoose.models.EventRegistration || model<EventRegistrationDocument>('EventRegistration', EventRegistrationSchema);

export default EventRegistrationModel;
