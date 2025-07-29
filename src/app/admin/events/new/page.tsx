
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import type { Event } from '@/types/db';

const eventSchema = z.object({
  id: z.string().min(3, 'Event ID/Slug must be at least 3 characters long').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  title: z.string().min(5, 'Title must be at least 5 characters long'),
  date: z.string().min(1, 'Date is required'), // Could use z.date() if using a date picker that provides Date object
  time: z.string().min(1, 'Time is required'),
  location: z.string().min(5, 'Location must be at least 5 characters long'),
  organizer: z.string().min(3, 'Organizer must be at least 3 characters long'),
  description: z.string().min(10, 'Short description must be at least 10 characters long'),
  fullDescription: z.string().min(20, 'Full description must be at least 20 characters long'),
  image: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  imageHint: z.string().optional(),
  altText: z.string().optional(),
  maxAttendees: z.coerce.number().int().min(1, 'Max attendees must be at least 1').optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

export default function AddEventPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  const onSubmit: SubmitHandler<EventFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create event');
      }

      toast({
        title: 'Success',
        description: 'Event created successfully!',
      });
      reset(); // Clear the form
      router.push('/admin/manage/events'); // Redirect to events management page
    } catch (error) {
      console.error('Failed to create event:', error);
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
          <Link href="/admin/manage/events">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events Management
          </Link>
        </Button>
      </div>

      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">Add New Event</CardTitle>
          <CardDescription>Fill in the details for the new event.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="id">Event ID/Slug</Label>
              <Input id="id" {...register('id')} placeholder="e.g., annual-tree-planting-2024" />
              {errors.id && <p className="text-sm text-destructive mt-1">{errors.id.message}</p>}
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register('title')} placeholder="Event Title" />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="text" {...register('date')} placeholder="YYYY-MM-DD or full date string" />
                 {errors.date && <p className="text-sm text-destructive mt-1">{errors.date.message}</p>}
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input id="time" type="text" {...register('time')} placeholder="e.g., 10:00 AM - 2:00 PM" />
                {errors.time && <p className="text-sm text-destructive mt-1">{errors.time.message}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...register('location')} placeholder="Event Location" />
              {errors.location && <p className="text-sm text-destructive mt-1">{errors.location.message}</p>}
            </div>
            <div>
              <Label htmlFor="organizer">Organizer</Label>
              <Input id="organizer" {...register('organizer')} placeholder="Organizer Name" />
              {errors.organizer && <p className="text-sm text-destructive mt-1">{errors.organizer.message}</p>}
            </div>
            <div>
              <Label htmlFor="description">Short Description</Label>
              <Textarea id="description" {...register('description')} placeholder="A brief summary of the event" />
              {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
            </div>
            <div>
              <Label htmlFor="fullDescription">Full Description</Label>
              <Textarea id="fullDescription" {...register('fullDescription')} placeholder="Detailed information about the event" rows={5} />
              {errors.fullDescription && <p className="text-sm text-destructive mt-1">{errors.fullDescription.message}</p>}
            </div>
             <div>
              <Label htmlFor="image">Image URL (Optional)</Label>
              <Input id="image" {...register('image')} placeholder="https://placehold.co/1200x600.png" />
              {errors.image && <p className="text-sm text-destructive mt-1">{errors.image.message}</p>}
            </div>
             <div>
              <Label htmlFor="imageHint">Image AI Hint (Optional, 1-2 keywords)</Label>
              <Input id="imageHint" {...register('imageHint')} placeholder="e.g., forest trees" />
              {errors.imageHint && <p className="text-sm text-destructive mt-1">{errors.imageHint.message}</p>}
            </div>
             <div>
              <Label htmlFor="altText">Image Alt Text (Optional)</Label>
              <Input id="altText" {...register('altText')} placeholder="Descriptive text for the image" />
              {errors.altText && <p className="text-sm text-destructive mt-1">{errors.altText.message}</p>}
            </div>
            <div>
              <Label htmlFor="maxAttendees">Max Attendees (Optional)</Label>
              <Input id="maxAttendees" type="number" {...register('maxAttendees')} placeholder="e.g., 100" />
              {errors.maxAttendees && <p className="text-sm text-destructive mt-1">{errors.maxAttendees.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Create Event
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
