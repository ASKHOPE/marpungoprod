
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save, AlertTriangle } from 'lucide-react';
import type { Event as EventType } from '@/types/db';

const eventSchema = z.object({
  // id (slug) is not editable here, it's part of the URL
  title: z.string().min(5, 'Title must be at least 5 characters long'),
  date: z.string().min(1, 'Date is required'),
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

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const eventObjectId = params.id as string; // This is the MongoDB ObjectId

  const [event, setEvent] = useState<EventType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset, // To populate form with fetched data
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  useEffect(() => {
    if (eventObjectId) {
      const fetchEvent = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/admin/events/${eventObjectId}`);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to fetch event: ${response.statusText}`);
          }
          const data: EventType = await response.json();
          setEvent(data);
          // Populate form with fetched data
          reset({
            title: data.title,
            date: data.date, // Assuming data.date is a string in "YYYY-MM-DD" or compatible format
            time: data.time,
            location: data.location,
            organizer: data.organizer,
            description: data.description,
            fullDescription: data.fullDescription,
            image: data.image,
            imageHint: data.imageHint,
            altText: data.altText,
            maxAttendees: data.maxAttendees,
          });
        } catch (err) {
          console.error('Failed to fetch event:', err);
          setError(err instanceof Error ? err.message : 'An unknown error occurred.');
          toast({
            title: 'Error Fetching Event',
            description: err instanceof Error ? err.message : 'Could not load event details.',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchEvent();
    }
  }, [eventObjectId, reset, toast]);

  const onSubmit: SubmitHandler<EventFormData> = async (data) => {
    if (!event?._id) {
      toast({ title: 'Error', description: 'Event ID is missing.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/events/${event._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update event');
      }

      toast({
        title: 'Success',
        description: 'Event updated successfully!',
      });
      router.push('/admin/manage/events'); // Redirect to events management page
    } catch (error) {
      console.error('Failed to update event:', error);
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
        <p className="text-xl text-foreground/80">Loading event details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h1 className="text-3xl font-bold text-destructive mb-4">Error Loading Event</h1>
        <p className="text-foreground/80 mb-8">{error || 'Event data could not be found.'}</p>
        <Button asChild variant="outline">
          <Link href="/admin/manage/events">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events Management
          </Link>
        </Button>
      </div>
    );
  }


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
          <CardTitle className="text-2xl font-headline text-primary">Edit Event: {event?.title}</CardTitle>
          <CardDescription>Update the details for this event (Event Slug/ID: <code className="bg-muted px-1 rounded">{event.id}</code> is not editable).</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register('title')} />
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
              <Input id="location" {...register('location')} />
              {errors.location && <p className="text-sm text-destructive mt-1">{errors.location.message}</p>}
            </div>
            <div>
              <Label htmlFor="organizer">Organizer</Label>
              <Input id="organizer" {...register('organizer')} />
              {errors.organizer && <p className="text-sm text-destructive mt-1">{errors.organizer.message}</p>}
            </div>
            <div>
              <Label htmlFor="description">Short Description</Label>
              <Textarea id="description" {...register('description')} />
              {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
            </div>
            <div>
              <Label htmlFor="fullDescription">Full Description</Label>
              <Textarea id="fullDescription" {...register('fullDescription')} rows={5} />
              {errors.fullDescription && <p className="text-sm text-destructive mt-1">{errors.fullDescription.message}</p>}
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
            <div>
              <Label htmlFor="maxAttendees">Max Attendees (Optional)</Label>
              <Input id="maxAttendees" type="number" {...register('maxAttendees')} />
              {errors.maxAttendees && <p className="text-sm text-destructive mt-1">{errors.maxAttendees.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting || isLoading}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Update Event
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
