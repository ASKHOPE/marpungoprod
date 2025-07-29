
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ProjectModel from '@/models/Project';
import mongoose from 'mongoose';
import { z } from 'zod';
import type { Project as ProjectType } from '@/types/db'; // For status enum
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

const projectUpdateSchema = z.object({
  title: z.string().min(5).optional(),
  description: z.string().min(10).optional(),
  longDescription: z.string().optional().nullable(),
  image: z.string().url().or(z.literal('')).optional(),
  imageHint: z.string().max(50).optional().nullable(),
  altText: z.string().max(200).optional().nullable(),
  goalAmount: z.coerce.number().positive().optional(),
  currentAmount: z.coerce.number().min(0).optional(),
  status: z.enum(['active', 'funded', 'archived'] as [ProjectType['status'], ...ProjectType['status'][]]).optional(),
  startDate: z.string().nullable().optional().refine(val => val === null || val === '' || !val || !isNaN(Date.parse(val)), { message: "Invalid start date format" }),
  endDate: z.string().nullable().optional().refine(val => val === null || val === '' || !val || !isNaN(Date.parse(val)), { message: "Invalid end date format" }),
});


export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const projectObjectId = params.id;
    if (!mongoose.Types.ObjectId.isValid(projectObjectId)) {
      return NextResponse.json({ error: 'Invalid project ID format' }, { status: 400 });
    }

    const project = await ProjectModel.findById(projectObjectId).lean();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    const projectWithStringId = { 
      ...project, 
      _id: project._id.toString(),
      startDate: project.startDate ? new Date(project.startDate).toISOString() : undefined,
      endDate: project.endDate ? new Date(project.endDate).toISOString() : undefined,
    };
    return NextResponse.json(projectWithStringId);

  } catch (error) {
    console.error('Failed to fetch project for admin:', error);
    return NextResponse.json({ error: 'Internal Server Error. Failed to fetch project.' }, { status: 500 });
  }
}

async function updateStripeEntitiesActivity(
    project: ProjectType, 
    isActive: boolean
): Promise<{ warnings: string[], updatedProduct?: Stripe.Product, updatedPrice?: Stripe.Price, updatedPaymentLink?: Stripe.PaymentLink }> {
    let warnings: string[] = [];
    let updatedProduct, updatedPrice, updatedPaymentLink;

    if (!process.env.STRIPE_SECRET_KEY) {
        warnings.push("STRIPE_SECRET_KEY not configured. Cannot update Stripe entities.");
        return { warnings };
    }

    const { stripeProductId, stripePriceId, stripePaymentLinkUrl } = project;

    if (stripePaymentLinkUrl) {
        const paymentLinkIdMatch = stripePaymentLinkUrl.match(/plink_[a-zA-Z0-9]+/);
        if (paymentLinkIdMatch && paymentLinkIdMatch[0]) {
            const paymentLinkId = paymentLinkIdMatch[0];
            try {
                updatedPaymentLink = await stripe.paymentLinks.update(paymentLinkId, { active: isActive });
            } catch (e: any) {
                warnings.push(`Failed to ${isActive ? 'activate' : 'deactivate'} Stripe Payment Link (${e.message}).`);
            }
        } else {
            warnings.push(`Could not extract Payment Link ID from URL: ${stripePaymentLinkUrl}.`);
        }
    }

    // It is generally not recommended to deactivate/archive prices or products unless truly necessary,
    // as it can affect existing subscriptions or payment links. 
    // For projects, deactivating the payment link is usually sufficient.
    // If you absolutely need to archive the product/price, ensure it's the desired behavior.
    // For now, we will primarily focus on the payment link.
    // if (stripePriceId) {
    //     try {
    //         updatedPrice = await stripe.prices.update(stripePriceId, { active: isActive });
    //     } catch (e: any) {
    //         warnings.push(\`Failed to \${isActive ? 'activate' : 'archive'} Stripe Price (\${e.message}).\`);
    //     }
    // }

    // if (stripeProductId) {
    //     try {
    //         // Archiving a product by setting active: false
    //         updatedProduct = await stripe.products.update(stripeProductId, { active: isActive });
    //     } catch (e: any) {
    //         warnings.push(\`Failed to \${isActive ? 'activate' : 'archive'} Stripe Product (\${e.message}).\`);
    //     }
    // }
    
    return { warnings, updatedProduct, updatedPrice, updatedPaymentLink };
}


export async function PUT(request: Request, { params }: { params: { id: string } }) {
  let stripeWarnings: string[] = [];
  try {
    await connectDB();
    const projectObjectId = params.id;
    if (!mongoose.Types.ObjectId.isValid(projectObjectId)) {
      return NextResponse.json({ error: 'Invalid project ID format' }, { status: 400 });
    }

    const existingProjectDoc = await ProjectModel.findById(projectObjectId);
    if (!existingProjectDoc) {
      return NextResponse.json({ error: 'Project not found for update' }, { status: 404 });
    }
    // Convert to plain object for Stripe logic if needed, but existingProjectDoc has all fields
    const existingProject = existingProjectDoc.toObject() as ProjectType & { _id: mongoose.Types.ObjectId };


    const body = await request.json();
    const validation = projectUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input data for updating project', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const validatedData = validation.data;

    if (Object.keys(validatedData).length === 0) {
        return NextResponse.json({ error: 'No update data provided' }, { status: 400 });
    }
    
    const updateOps: any = { $set: {}, $unset: {} };
    
    for (const key in validatedData) {
        const typedKey = key as keyof typeof validatedData;
        if (validatedData[typedKey] === null || validatedData[typedKey] === '') {
             if (['startDate', 'endDate', 'longDescription', 'imageHint', 'altText'].includes(typedKey)) {
                 updateOps.$unset[typedKey] = ""; 
            }
        } else if (validatedData[typedKey] !== undefined) {
            if (typedKey === 'startDate' || typedKey === 'endDate') {
                if (validatedData[typedKey]) {
                    updateOps.$set[typedKey] = new Date(validatedData[typedKey] as string);
                } else {
                    updateOps.$unset[typedKey] = ""; 
                }
            } else {
                updateOps.$set[typedKey] = validatedData[typedKey];
            }
        }
    }
    // updateOps.$set.updatedAt = new Date(); // Mongoose handles this with timestamps:true

    if (Object.keys(updateOps.$set).length === 0 && Object.keys(updateOps.$unset).length === 0) { 
         return NextResponse.json({ message: 'No changes detected. Project not modified.', project: { ...existingProject, _id: existingProject._id.toString() } }, { status: 200 });
    }
    if (Object.keys(updateOps.$unset).length === 0) delete updateOps.$unset;

    if (validatedData.status && existingProject.status !== validatedData.status) {
        const newStripeActiveState = validatedData.status === 'active';
        const stripeUpdateResult = await updateStripeEntitiesActivity(existingProject, newStripeActiveState);
        stripeWarnings = stripeUpdateResult.warnings;
    }
    
    const updatedProjectDoc = await ProjectModel.findByIdAndUpdate(
      projectObjectId,
      updateOps,
      { new: true, runValidators: true } // new:true returns the modified document
    ).lean();


    if (!updatedProjectDoc) { 
      return NextResponse.json({ error: 'Project not found after update attempt' }, { status: 404 });
    }
    
    const responsePayload = { 
        ...updatedProjectDoc, 
        _id: updatedProjectDoc._id.toString(),
        startDate: updatedProjectDoc.startDate ? updatedProjectDoc.startDate.toISOString() : undefined,
        endDate: updatedProjectDoc.endDate ? updatedProjectDoc.endDate.toISOString() : undefined,
        stripeWarning: stripeWarnings.length > 0 ? stripeWarnings.join(' ') : undefined
    };
    return NextResponse.json(responsePayload, { status: 200 });

  } catch (error) {
    console.error('Failed to update project:', error);
     if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data format', details: error.errors }, { status: 400 });
    }
     if (error instanceof mongoose.Error.ValidationError) {
        return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error. Failed to update project.' }, { status: 500 });
  }
}


export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  let stripeWarnings: string[] = [];
  try {
    await connectDB();
    const projectObjectId = params.id;
    if (!mongoose.Types.ObjectId.isValid(projectObjectId)) {
      return NextResponse.json({ error: 'Invalid project ID format' }, { status: 400 });
    }

    const projectToDeleteDoc = await ProjectModel.findById(projectObjectId);

    if (!projectToDeleteDoc) {
      return NextResponse.json({ error: 'Project not found or already deleted' }, { status: 404 });
    }
    const projectToDelete = projectToDeleteDoc.toObject() as ProjectType & { _id: mongoose.Types.ObjectId };

    const stripeUpdateResult = await updateStripeEntitiesActivity(projectToDelete, false); 
    stripeWarnings = stripeUpdateResult.warnings;
    
    const deleteResult = await ProjectModel.findByIdAndDelete(projectObjectId);

    if (!deleteResult) { 
      return NextResponse.json({ error: 'Project not found or already deleted (race condition during delete)' }, { status: 404 });
    }

    return NextResponse.json({ 
        message: 'Project deleted successfully.',
        stripeWarning: stripeWarnings.length > 0 ? stripeWarnings.join(' ') : undefined
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to delete project:', error);
    return NextResponse.json({ error: 'Internal Server Error. Failed to delete project.' }, { status: 500 });
  }
}

