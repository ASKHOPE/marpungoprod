
import { NextResponse, type NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ProjectModel from '@/models/Project';
import { z } from 'zod';
import type { Project as ProjectType } from '@/types/db'; // For status enum consistency
import mongoose from 'mongoose';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20', 
});

const projectCreateSchema = z.object({
  slug: z.string().min(3, 'Slug must be at least 3 characters').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  title: z.string().min(5, 'Title must be at least 5 characters long'),
  description: z.string().min(10, 'Short description must be at least 10 characters long'),
  longDescription: z.string().optional(),
  image: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  imageHint: z.string().max(50).optional(),
  altText: z.string().max(200).optional(),
  goalAmount: z.coerce.number().positive('Goal amount must be a positive number'),
  status: z.enum(['active', 'funded', 'archived'] as [ProjectType['status'], ...ProjectType['status'][]], { required_error: 'Status is required' }),
  startDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), { message: "Invalid date format" }),
  endDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), { message: "Invalid date format" }),
});

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status') as ProjectType['status'] | 'all' | null;

    let query: mongoose.FilterQuery<import('@/models/Project').ProjectDocument> = {};

    if (statusFilter && statusFilter !== 'all' && ['active', 'funded', 'archived'].includes(statusFilter)) {
      query.status = statusFilter;
    }

    const allProjectsData = await ProjectModel
      .find(query)
      .sort({ createdAt: -1 }) 
      .lean();

    const processedProjects = allProjectsData.map(project => ({
      ...project,
      _id: project._id?.toString(),
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : undefined,
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : undefined,
    }));

    return NextResponse.json(processedProjects);
  } catch (error) {
    console.error('Failed to fetch all projects for admin:', error);
    return NextResponse.json({ error: 'Internal Server Error. Failed to fetch projects.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const validation = projectCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input data', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const validatedData = validation.data;

    const existingProjectBySlug = await ProjectModel.findOne({ slug: validatedData.slug });
    if (existingProjectBySlug) {
      return NextResponse.json({ error: `Project with slug '${validatedData.slug}' already exists.` }, { status: 409 });
    }
    
    const newProjectData: Omit<ProjectType, '_id' | 'stripeProductId' | 'stripePriceId' | 'stripePaymentLinkUrl' | 'createdAt' | 'updatedAt' | 'currentAmount'> & { currentAmount: number } = {
      ...validatedData,
      currentAmount: 0,
      image: validatedData.image || `https://placehold.co/600x300.png`,
      imageHint: validatedData.imageHint || (validatedData.title.split(' ').slice(0,2).join(' ') || 'project placeholder'),
      altText: validatedData.altText || `Placeholder image for ${validatedData.title}`,
      startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
      endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
    };

    const projectToSave = new ProjectModel(newProjectData);
    const savedProject = await projectToSave.save();
    
    let stripeProductId: string | undefined;
    let stripePriceId: string | undefined;
    let stripePaymentLinkUrl: string | undefined;
    let stripeWarning: string | undefined;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const successUrl = appUrl ? `${appUrl}/payment-success?project_id=${savedProject.slug}&status=success` : undefined;


    if (process.env.STRIPE_SECRET_KEY) {
        try {
        const stripeProduct = await stripe.products.create({
            name: savedProject.title,
            description: savedProject.description,
            metadata: { marpuProjectId: savedProject._id.toString(), marpuProjectSlug: savedProject.slug },
        });
        stripeProductId = stripeProduct.id;

        const stripePrice = await stripe.prices.create({
            product: stripeProductId, currency: 'usd', custom_unit_amount: { enabled: true, minimum: 1000 }, // Minimum $10.00
            metadata: { marpuProjectId: savedProject._id.toString() },
        });
        stripePriceId = stripePrice.id;

        const paymentLinkParams: Stripe.PaymentLinkCreateParams = {
            line_items: [{ price: stripePriceId, quantity: 1 }],
            metadata: { marpuProjectId: savedProject._id.toString() },
        };

        if (successUrl) {
            paymentLinkParams.after_completion = {
                type: 'redirect',
                redirect: { url: successUrl },
            };
        } else {
            console.warn("NEXT_PUBLIC_APP_URL not set. Stripe Payment Link will redirect to Stripe's default success page.");
            stripeWarning = "Project created. NEXT_PUBLIC_APP_URL not set, Stripe success redirect might not be configured to custom page.";
        }

        const paymentLink = await stripe.paymentLinks.create(paymentLinkParams);
        stripePaymentLinkUrl = paymentLink.url;

        savedProject.stripeProductId = stripeProductId;
        savedProject.stripePriceId = stripePriceId;
        savedProject.stripePaymentLinkUrl = stripePaymentLinkUrl;
        await savedProject.save();

        } catch (stripeError: any) {
        console.error('Stripe API error during project creation:', stripeError);
        const existingWarning = stripeWarning ? stripeWarning + " " : "";
        stripeWarning = `${existingWarning}Project created, but failed to link Stripe resources: ${stripeError.message}. Check Stripe dashboard. Project ID ${savedProject._id.toString()}`;
        }
    } else {
        stripeWarning = "STRIPE_SECRET_KEY not configured. Project created without Stripe integration.";
    }
    
    const finalProject = savedProject.toObject();
    const responsePayload = {
      ...finalProject,
      _id: finalProject._id.toString(),
      stripeWarning: stripeWarning 
    };
    
    return NextResponse.json(responsePayload, { status: 201 });

  } catch (error) {
    console.error('Failed to create project:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data format', details: error.flatten().fieldErrors }, { status: 400 });
    }
     if (error instanceof mongoose.Error.ValidationError) {
        return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error. Failed to create project.' }, { status: 500 });
  }
}
