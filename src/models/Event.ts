
import mongoose, { Schema, model, Document } from "mongoose";
import type { Event as IEvent } from "@/types/db"; // Using IEvent to avoid naming conflict

export interface EventDocument extends IEvent, Document {}

const EventSchema = new Schema<EventDocument>({
  id: { // This is the slug
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  date: { // Storing as String, assuming ISO format as per previous usage
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  organizer: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  fullDescription: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
    default: 'https://placehold.co/1200x600.png',
  },
  imageHint: {
    type: String,
    default: 'event placeholder',
  },
  altText: {
    type: String,
    default: 'Placeholder image for event',
  },
  maxAttendees: {
    type: Number,
    required: false,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
},
{
  timestamps: true, // This will add createdAt and updatedAt fields
});

// Ensure the model is not recompiled if it already exists
const EventModel = mongoose.models.Event || model<EventDocument>('Event', EventSchema);

export default EventModel;
