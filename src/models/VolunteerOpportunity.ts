
import mongoose, { Schema, model, Document } from "mongoose";
import type { VolunteerOpportunity as IVolunteerOpportunity } from "@/types/db";

export interface VolunteerOpportunityDocument extends IVolunteerOpportunity, Document {}

const VolunteerOpportunitySchema = new Schema<VolunteerOpportunityDocument>({
  id: { // This is the slug
    type: String,
    required: [true, "Opportunity ID/slug is required"],
    unique: true,
    trim: true,
  },
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
  },
  commitment: {
    type: String,
    required: [true, "Commitment details are required"],
  },
  location: {
    type: String,
    required: [true, "Location is required"],
  },
  skills: {
    type: String,
    required: [true, "Skills required are required"],
  },
  description: {
    type: String,
    required: [true, "Description is required"],
  },
  image: {
    type: String,
    required: true,
    default: 'https://placehold.co/600x400.png',
  },
  imageHint: {
    type: String,
    default: 'volunteer opportunity',
  },
  altText: {
    type: String,
    default: 'Placeholder image for volunteer opportunity',
  },
},
{
  timestamps: true, // Adds createdAt and updatedAt fields
  collection: 'volunteer_opportunities', // Explicitly set collection name
});

const VolunteerOpportunityModel = mongoose.models.VolunteerOpportunity || model<VolunteerOpportunityDocument>('VolunteerOpportunity', VolunteerOpportunitySchema);

export default VolunteerOpportunityModel;
