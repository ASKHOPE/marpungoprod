
import mongoose, { Schema, model, Document } from "mongoose";
import type { VolunteerApplication as IVolunteerApplication } from "@/types/db";

export interface VolunteerApplicationDocument extends IVolunteerApplication, Document {}

const VolunteerApplicationSchema = new Schema<VolunteerApplicationDocument>({
  opportunityId: { // Corresponds to VolunteerOpportunity.id (slug)
    type: String,
    required: true,
  },
  opportunityTitle: { // Denormalized
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
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
  phone: {
    type: String,
    required: false,
  },
  interestReason: {
    type: String,
    required: true,
  },
  skills: {
    type: String,
    required: false,
  },
  availability: {
    type: String,
    required: false,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'accepted', 'rejected'],
    default: 'pending',
  },
  notes: { // For admin notes
    type: String,
    required: false,
  },
},
{
  timestamps: { createdAt: 'submittedAt', updatedAt: 'updatedAt' }, // Use submittedAt as createdAt
  collection: 'volunteer_applications', // Explicitly set collection name
});

const VolunteerApplicationModel = mongoose.models.VolunteerApplication || model<VolunteerApplicationDocument>('VolunteerApplication', VolunteerApplicationSchema);

export default VolunteerApplicationModel;
