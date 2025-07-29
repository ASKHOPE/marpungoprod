
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save, Package, AlertTriangle } from 'lucide-react';

// Schema without stripePaymentLinkUrl as it's auto-generated
const projectSchema = z.object({
  slug: z.string().min(3, 'Slug must be at least 3 characters').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens (e.g., my-cool-project)'),
  title: z.string().min(5, 'Title must be at least 5 characters long'),
  description: z.string().min(10, 'Short description must be at least 10 characters long'),
  longDescription: z.string().optional(),
  image: z.string().url('Must be a valid URL (e.g., https://placehold.co/600x300.png)').or(z.literal('')).optional(),
  imageHint: z.string().max(50, 'Image hint should be 1-2 keywords').optional(),
  altText: z.string().max(200, 'Alt text should be descriptive').optional(),
  goalAmount: z.coerce.number().positive('Goal amount must be a positive number'),
  status: z.enum(['active', 'funded', 'archived'], { required_error: 'Status is required' }),
  startDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), { message: "Invalid date format. Use YYYY-MM-DD or leave empty." }),
  endDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), { message: "Invalid date format. Use YYYY-MM-DD or leave empty." }),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function AddDonationProjectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control, 
    formState: { errors },
    reset,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      status: 'active', 
      image: 'https://placehold.co/600x300.png',
    },
  });

  const onSubmit: SubmitHandler<ProjectFormData> = async (data) => {
    setIsSubmitting(true);
    setSubmissionError(null);
    try {
      const response = await fetch('/api/admin/manage/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessage = responseData.error || 'Failed to create project';
        if (responseData.details) {
            const fieldErrors = Object.entries(responseData.details).map(([key, value]) => `${key}: ${(value as string[])?.join(', ')}`).join('; ');
            errorMessage += ` Details: ${fieldErrors}`;
        }
        throw new Error(errorMessage);
      }
      
      let successMessage = 'Donation project created successfully!';
      if (responseData.stripeWarning) {
        successMessage += ` Stripe Warning: ${responseData.stripeWarning}`;
        toast({
          title: 'Project Created (with Stripe Warning)',
          description: successMessage,
          variant: 'default', // Or a custom 'warning' variant if you have one
          duration: 10000,
        });
      } else {
        toast({
          title: 'Success',
          description: successMessage,
        });
      }

      reset(); 
      router.push('/admin/manage/donation-projects'); 
    } catch (error) {
      console.error('Failed to create project:', error);
      const errMsg = error instanceof Error ? error.message : 'An unexpected error occurred.';
      setSubmissionError(errMsg);
      toast({
        title: 'Error Creating Project',
        description: errMsg,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/manage/donation-projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects List
          </Link>
        </Button>
      </div>

      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary flex items-center">
            <Package className="w-6 h-6 mr-3 text-accent" /> Add New Donation Project
          </CardTitle>
          <CardDescription>Fill in the details for the new donation project. A Stripe Product, Price (for custom amounts), and Payment Link will be automatically generated.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="slug">Project Slug (URL Identifier)</Label>
              <Input id="slug" {...register('slug')} placeholder="e.g., save-the-rainforest-2024" />
              {errors.slug && <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>}
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register('title')} placeholder="Project Title" />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <Label htmlFor="description">Short Description (for cards)</Label>
              <Textarea id="description" {...register('description')} placeholder="A brief summary of the project" />
              {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
            </div>
            <div>
              <Label htmlFor="longDescription">Full Description (Optional)</Label>
              <Textarea id="longDescription" {...register('longDescription')} placeholder="Detailed information about the project" rows={5} />
              {errors.longDescription && <p className="text-sm text-destructive mt-1">{errors.longDescription.message}</p>}
            </div>
             <div>
              <Label htmlFor="image">Image URL</Label>
              <Input id="image" {...register('image')} />
              {errors.image && <p className="text-sm text-destructive mt-1">{errors.image.message}</p>}
            </div>
             <div>
              <Label htmlFor="imageHint">Image AI Hint (Optional, 1-2 keywords)</Label>
              <Input id="imageHint" {...register('imageHint')} placeholder="e.g., forest trees" />
              {errors.imageHint && <p className="text-sm text-destructive mt-1">{errors.imageHint.message}</p>}
            </div>
             <div>
              <Label htmlFor="altText">Image Alt Text (Recommended)</Label>
              <Input id="altText" {...register('altText')} placeholder="Descriptive text for the image" />
              {errors.altText && <p className="text-sm text-destructive mt-1">{errors.altText.message}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="goalAmount">Goal Amount ($)</Label>
                <Input id="goalAmount" type="number" {...register('goalAmount')} placeholder="e.g., 5000" />
                {errors.goalAmount && <p className="text-sm text-destructive mt-1">{errors.goalAmount.message}</p>}
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="status">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="funded">Funded</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                        </Select>
                    )}
                />
                {errors.status && <p className="text-sm text-destructive mt-1">{errors.status.message}</p>}
              </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="startDate">Start Date (Optional, YYYY-MM-DD)</Label>
                    <Input id="startDate" type="text" {...register('startDate')} placeholder="e.g., 2024-01-01" />
                    {errors.startDate && <p className="text-sm text-destructive mt-1">{errors.startDate.message}</p>}
                </div>
                <div>
                    <Label htmlFor="endDate">End Date (Optional, YYYY-MM-DD)</Label>
                    <Input id="endDate" type="text" {...register('endDate')} placeholder="e.g., 2024-12-31" />
                    {errors.endDate && <p className="text-sm text-destructive mt-1">{errors.endDate.message}</p>}
                </div>
            </div>
            {submissionError && (
              <p className="text-sm text-destructive flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" /> {submissionError}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Create Project
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
