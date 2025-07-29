
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { ArrowLeft, Loader2, Save } from 'lucide-react';

const volunteerOpportunitySchema = z.object({
  id: z.string().min(3, 'Opportunity ID/Slug must be at least 3 characters long').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  title: z.string().min(5, 'Title must be at least 5 characters long'),
  commitment: z.string().min(3, 'Commitment details are required'),
  location: z.string().min(5, 'Location must be at least 5 characters long'),
  skills: z.string().min(5, 'Skills required must be at least 5 characters long'),
  description: z.string().min(10, 'Description must be at least 10 characters long'),
  image: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  imageHint: z.string().optional(),
  altText: z.string().optional(),
});

type VolunteerOpportunityFormData = z.infer<typeof volunteerOpportunitySchema>;

export default function AddVolunteerOpportunityPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VolunteerOpportunityFormData>({
    resolver: zodResolver(volunteerOpportunitySchema),
  });

  const onSubmit: SubmitHandler<VolunteerOpportunityFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/volunteer-opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create volunteer opportunity');
      }

      toast({
        title: 'Success',
        description: 'Volunteer opportunity created successfully!',
      });
      reset(); 
      router.push('/admin/manage/volunteer-opportunities'); // Redirect to opportunities management page
    } catch (error) {
      console.error('Failed to create volunteer opportunity:', error);
      toast({
        title: 'Error',
        description: (error instanceof Error ? error.message : 'An unexpected error occurred.'),
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
          <Link href="/admin/manage/volunteer-opportunities">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Opportunities Management
          </Link>
        </Button>
      </div>

      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">Add New Volunteer Opportunity</CardTitle>
          <CardDescription>Fill in the details for the new volunteer opportunity.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="id">Opportunity ID/Slug</Label>
              <Input id="id" {...register('id')} placeholder="e.g., park-cleanup-crew-2024" />
              {errors.id && <p className="text-sm text-destructive mt-1">{errors.id.message}</p>}
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register('title')} placeholder="Opportunity Title" />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
            </div>
             <div>
              <Label htmlFor="commitment">Commitment</Label>
              <Input id="commitment" {...register('commitment')} placeholder="e.g., Flexible, 2-4 hours/week" />
              {errors.commitment && <p className="text-sm text-destructive mt-1">{errors.commitment.message}</p>}
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...register('location')} placeholder="Location of the opportunity" />
              {errors.location && <p className="text-sm text-destructive mt-1">{errors.location.message}</p>}
            </div>
             <div>
              <Label htmlFor="skills">Skills Required</Label>
              <Input id="skills" {...register('skills')} placeholder="e.g., Enthusiasm, teamwork" />
              {errors.skills && <p className="text-sm text-destructive mt-1">{errors.skills.message}</p>}
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register('description')} placeholder="A brief summary of the opportunity" />
              {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
            </div>
             <div>
              <Label htmlFor="image">Image URL (Optional)</Label>
              <Input id="image" {...register('image')} placeholder="https://placehold.co/600x400.png" />
              {errors.image && <p className="text-sm text-destructive mt-1">{errors.image.message}</p>}
            </div>
             <div>
              <Label htmlFor="imageHint">Image AI Hint (Optional, 1-2 keywords)</Label>
              <Input id="imageHint" {...register('imageHint')} placeholder="e.g., volunteers park" />
              {errors.imageHint && <p className="text-sm text-destructive mt-1">{errors.imageHint.message}</p>}
            </div>
             <div>
              <Label htmlFor="altText">Image Alt Text (Optional)</Label>
              <Input id="altText" {...register('altText')} placeholder="Descriptive text for the image" />
              {errors.altText && <p className="text-sm text-destructive mt-1">{errors.altText.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Create Opportunity
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
