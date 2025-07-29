
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save, AlertTriangle } from 'lucide-react';
import type { VolunteerOpportunity as OpportunityType } from '@/types/db';

const volunteerOpportunityUpdateSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long').optional(),
  commitment: z.string().min(3, 'Commitment details are required').optional(),
  location: z.string().min(5, 'Location must be at least 5 characters long').optional(),
  skills: z.string().min(5, 'Skills required must be at least 5 characters long').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters long').optional(),
  image: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  imageHint: z.string().optional(),
  altText: z.string().optional(),
});

type OpportunityFormData = z.infer<typeof volunteerOpportunityUpdateSchema>;

export default function EditVolunteerOpportunityPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const opportunityObjectId = params.id as string; 

  const [opportunity, setOpportunity] = useState<OpportunityType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset, 
    formState: { errors },
  } = useForm<OpportunityFormData>({
    resolver: zodResolver(volunteerOpportunityUpdateSchema),
  });

  useEffect(() => {
    if (opportunityObjectId) {
      const fetchOpportunity = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/admin/volunteer-opportunities/${opportunityObjectId}`);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to fetch opportunity: ${response.statusText}`);
          }
          const data: OpportunityType = await response.json();
          setOpportunity(data);
          reset({
            title: data.title,
            commitment: data.commitment,
            location: data.location,
            skills: data.skills,
            description: data.description,
            image: data.image,
            imageHint: data.imageHint,
            altText: data.altText,
          });
        } catch (err) {
          console.error('Failed to fetch opportunity:', err);
          setError(err instanceof Error ? err.message : 'An unknown error occurred.');
          toast({
            title: 'Error Fetching Opportunity',
            description: err instanceof Error ? err.message : 'Could not load opportunity details.',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchOpportunity();
    }
  }, [opportunityObjectId, reset, toast]);

  const onSubmit: SubmitHandler<OpportunityFormData> = async (data) => {
    if (!opportunity?._id) {
      toast({ title: 'Error', description: 'Opportunity ID is missing.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/volunteer-opportunities/${opportunity._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update opportunity');
      }

      toast({
        title: 'Success',
        description: 'Volunteer opportunity updated successfully!',
      });
      router.push('/admin/manage/volunteer-opportunities'); // Redirect to opportunities management page
    } catch (error) {
      console.error('Failed to update opportunity:', error);
      toast({
        title: 'Error',
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
        <p className="text-xl text-foreground/80">Loading opportunity details...</p>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="container mx-auto px-4 py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h1 className="text-3xl font-bold text-destructive mb-4">Error Loading Opportunity</h1>
        <p className="text-foreground/80 mb-8">{error || 'Opportunity data could not be found.'}</p>
        <Button asChild variant="outline">
          <Link href="/admin/manage/volunteer-opportunities">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Opportunities Management
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/manage/volunteer-opportunities">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Opportunities Management
          </Link>
        </Button>
      </div>
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">Edit Opportunity: {opportunity?.title}</CardTitle>
          <CardDescription>Update the details for this volunteer opportunity (Opportunity Slug/ID: <code className="bg-muted px-1 rounded">{opportunity.id}</code> is not editable).</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register('title')} />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <Label htmlFor="commitment">Commitment</Label>
              <Input id="commitment" {...register('commitment')} />
              {errors.commitment && <p className="text-sm text-destructive mt-1">{errors.commitment.message}</p>}
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...register('location')} />
              {errors.location && <p className="text-sm text-destructive mt-1">{errors.location.message}</p>}
            </div>
             <div>
              <Label htmlFor="skills">Skills Required</Label>
              <Input id="skills" {...register('skills')} />
              {errors.skills && <p className="text-sm text-destructive mt-1">{errors.skills.message}</p>}
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register('description')} rows={4} />
              {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
            </div>
            <div>
              <Label htmlFor="image">Image URL (Optional)</Label>
              <Input id="image" {...register('image')} />
              {errors.image && <p className="text-sm text-destructive mt-1">{errors.image.message}</p>}
            </div>
             <div>
              <Label htmlFor="imageHint">Image AI Hint (Optional, 1-2 keywords)</Label>
              <Input id="imageHint" {...register('imageHint')} />
              {errors.imageHint && <p className="text-sm text-destructive mt-1">{errors.imageHint.message}</p>}
            </div>
             <div>
              <Label htmlFor="altText">Image Alt Text (Optional)</Label>
              <Input id="altText" {...register('altText')} />
              {errors.altText && <p className="text-sm text-destructive mt-1">{errors.altText.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting || isLoading}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Update Opportunity
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
