
import mongoose, { Schema, model, Document } from "mongoose";
import type { Project as IProject } from "@/types/db";

export interface ProjectDocument extends IProject, Document {}

const ProjectSchema = new Schema<ProjectDocument>({
  slug: {
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
  description: {
    type: String,
    required: true,
  },
  longDescription: {
    type: String,
    required: false,
  },
  image: {
    type: String,
    required: true,
    default: 'https://placehold.co/600x300.png',
  },
  imageHint: {
    type: String,
    default: 'project placeholder',
  },
  altText: {
    type: String,
    default: 'Placeholder image for project',
  },
  goalAmount: {
    type: Number,
    required: true,
  },
  currentAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'funded', 'archived'],
    required: true,
    default: 'active',
  },
  startDate: {
    type: Date,
    required: false,
  },
  endDate: {
    type: Date,
    required: false,
  },
  stripeProductId: {
    type: String,
    required: false,
  },
  stripePriceId: {
    type: String,
    required: false,
  },
  stripePaymentLinkUrl: {
    type: String,
    required: false,
  },
},
{
  timestamps: true, // Adds createdAt and updatedAt fields
});

const ProjectModel = mongoose.models.Project || model<ProjectDocument>('Project', ProjectSchema);

export default ProjectModel;
