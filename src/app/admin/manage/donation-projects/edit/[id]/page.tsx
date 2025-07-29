
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import { ArrowLeft, Loader2, Save, AlertTriangle, Package, ExternalLink } from 'lucide-react';
import type { Project as ProjectType } from '@/types/db';

// Schema for updating, stripe IDs and URL are not directly editable by user
const projectUpdateSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long').optional(),
  description: z.string().min(10, 'Short description must be at least 10 characters long').optional(),
  longDescription: z.string().optional().nullable(),
  image: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  imageHint: z.string().max(50).optional().nullable(),
  altText: z.string().max(200).optional().nullable(),
  goalAmount: z.coerce.number().positive('Goal amount must be positive').optional(),
  currentAmount: z.coerce.number().min(0, 'Current amount cannot be negative').optional(), 
  status: z.enum(['active', 'funded', 'archived']).optional(),
  startDate: z.string().optional().nullable().refine(val => !val || !isNaN(Date.parse(val)), { message: "Invalid date format. Use YYYY-MM-DD or leave empty." }),
  endDate: z.string().optional().nullable().refine(val => !val || !isNaN(Date.parse(val)), { message: "Invalid date format. Use YYYY-MM-DD or leave empty." }),
});

type ProjectUpdateFormData = z.infer<typeof projectUpdateSchema>;

function formatDateForInput(date?: Date | string): string {
  if (!date) return '';
  try {
    return new Date(date).toISOString().split('T')[0];
  } catch (e) {
    return ''; 
  }
}

export default function EditDonationProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const projectObjectId = params.id as string;

  const [project, setProject] = useState<ProjectType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProjectUpdateFormData>({
    resolver: zodResolver(projectUpdateSchema),
  });

  useEffect(() => {
    if (projectObjectId) {
      const fetchProject = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/admin/manage/projects/${projectObjectId}`);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to fetch project: ${response.statusText}`);
          }
          const data: ProjectType = await response.json();
          setProject(data);
          reset({
            title: data.title,
            description: data.description,
            longDescription: data.longDescription || '',
            image: data.image,
            imageHint: data.imageHint,
            altText: data.altText,
            goalAmount: data.goalAmount,
            currentAmount: data.currentAmount,
            status: data.status,
            startDate: data.startDate ? formatDateForInput(data.startDate) : '',
            endDate: data.endDate ? formatDateForInput(data.endDate) : '',
          });
        } catch (err) {
          console.error('Failed to fetch project:', err);
          setError(err instanceof Error ? err.message : 'An unknown error occurred.');
          toast({
            title: 'Error Fetching Project',
            description: err instanceof Error ? err.message : 'Could not load project details.',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchProject();
    }
  }, [projectObjectId, reset, toast]);

  const onSubmit: SubmitHandler<ProjectUpdateFormData> = async (data) => {
    if (!project?._id) {
      toast({ title: 'Error', description: 'Project ID is missing.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/manage/projects/${project._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update project');
      }

      toast({
        title: 'Success',
        description: 'Project updated successfully!',
      });
      router.push('/admin/manage/donation-projects');
    } catch (error) {
      console.error('Failed to update project:', error);
      toast({
        title: 'Error Updating Project',
        description: (error instanceof Error ? error.message : 'An unexpected error occurred.'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-xl text-foreground/80">Loading project details...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container mx-auto px-4 py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h1 className="text-3xl font-bold text-destructive mb-4">Error Loading Project</h1>
        <p className="text-foreground/80 mb-8">{error || 'Project data could not be found.'}</p>
        <Button asChild variant="outline">
          <Link href="/admin/manage/donation-projects">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects List
          </Link>
        </Button>
      </div>
    );
  }

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
             <Package className="w-6 h-6 mr-3 text-accent" /> Edit Project: {project?.title}
          </CardTitle>
          <CardDescription>Update the details for this project. Slug: <code className="bg-muted px-1 rounded">{project.slug}</code> (Not editable).</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register('title')} />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <Label htmlFor="description">Short Description</Label>
              <Textarea id="description" {...register('description')} />
              {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
            </div>
            <div>
              <Label htmlFor="longDescription">Full Description (Optional)</Label>
              <Textarea id="longDescription" {...register('longDescription')} rows={5} />
              {errors.longDescription && <p className="text-sm text-destructive mt-1">{errors.longDescription.message}</p>}
            </div>
            <div>
              <Label htmlFor="image">Image URL</Label>
              <Input id="image" {...register('image')} />
              {errors.image && <p className="text-sm text-destructive mt-1">{errors.image.message}</p>}
            </div>
             <div>
              <Label htmlFor="imageHint">Image AI Hint (Optional)</Label>
              <Input id="imageHint" {...register('imageHint')} />
              {errors.imageHint && <p className="text-sm text-destructive mt-1">{errors.imageHint.message}</p>}
            </div>
             <div>
              <Label htmlFor="altText">Image Alt Text (Recommended)</Label>
              <Input id="altText" {...register('altText')} />
              {errors.altText && <p className="text-sm text-destructive mt-1">{errors.altText.message}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="goalAmount">Goal Amount ($)</Label>
                <Input id="goalAmount" type="number" {...register('goalAmount')} />
                {errors.goalAmount && <p className="text-sm text-destructive mt-1">{errors.goalAmount.message}</p>}
              </div>
               <div>
                <Label htmlFor="currentAmount">Current Amount Raised ($)</Label>
                <Input id="currentAmount" type="number" {...register('currentAmount')} />
                {errors.currentAmount && <p className="text-sm text-destructive mt-1">{errors.currentAmount.message}</p>}
              </div>
            </div>
            <div>
                <Label htmlFor="status">Status</Label>
                 <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="startDate">Start Date (Optional, YYYY-MM-DD)</Label>
                    <Input id="startDate" type="text" {...register('startDate')} placeholder="YYYY-MM-DD" />
                    {errors.startDate && <p className="text-sm text-destructive mt-1">{errors.startDate.message}</p>}
                </div>
                <div>
                    <Label htmlFor="endDate">End Date (Optional, YYYY-MM-DD)</Label>
                    <Input id="endDate" type="text" {...register('endDate')} placeholder="YYYY-MM-DD" />
                    {errors.endDate && <p className="text-sm text-destructive mt-1">{errors.endDate.message}</p>}
                </div>
            </div>

            <div className="space-y-2 mt-4 pt-4 border-t">
                <Label className="text-muted-foreground">Stripe Information (Auto-generated)</Label>
                {project.stripeProductId && (
                    <div className="text-sm">
                        <span className="font-medium">Stripe Product ID:</span> <code className="bg-muted px-1 rounded text-xs">{project.stripeProductId}</code>
                    </div>
                )}
                {project.stripePriceId && (
                    <div className="text-sm">
                        <span className="font-medium">Stripe Price ID:</span> <code className="bg-muted px-1 rounded text-xs">{project.stripePriceId}</code>
                    </div>
                )}
                {project.stripePaymentLinkUrl ? (
                    <div className="text-sm">
                        <span className="font-medium">Stripe Payment Link:</span> 
                        <a 
                            href={project.stripePaymentLinkUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-accent hover:underline ml-1 break-all"
                        >
                            {project.stripePaymentLinkUrl} <ExternalLink className="inline-block h-3 w-3 ml-1"/>
                        </a>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No Stripe Payment Link generated for this project yet. This might indicate an issue during creation or that Stripe setup is pending.</p>
                )}
            </div>


            <Button type="submit" className="w-full mt-6" disabled={isSubmitting || isLoading}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Update Project
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
