
'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarDays, MapPin, Users, ArrowLeft, UserPlus, AlertTriangle, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { Event as EventType } from '@/types/db';
import { useToast } from '@/hooks/use-toast';

async function getEventData(slug: string): Promise<EventType | null> {
  const response = await fetch(`/api/events/${slug}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch event details');
  }
  return response.json();
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const eventSlug = params.id as string;
  
  const [event, setEvent] = useState<EventType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrationError, setRegistrationError] = useState<string | null>(null);


  useEffect(() => {
    if (eventSlug) {
      setIsLoading(true);
      setError(null);
      getEventData(eventSlug)
        .then(data => {
          if (data) {
            setEvent(data);
          } else {
            setError('Event not found or has been archived.');
          }
        })
        .catch(err => {
          console.error("Failed to fetch event data:", err);
          setError(err instanceof Error ? err.message : 'Failed to load event details. Please try again later.');
        })
        .finally(() => setIsLoading(false));
    }
  }, [eventSlug]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!event) return;
    setIsSubmitting(true);
    setRegistrationError(null);

    const formData = new FormData(e.currentTarget);
    const registrationData = {
      fullName: formData.get('name') as string,
      email: formData.get('email') as string,
      attendees: parseInt(formData.get('attendees') as string, 10),
      eventId: event.id, // slug
      eventTitle: event.title,
    };

    try {
      const response = await fetch('/api/event-registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || `Registration failed: ${response.statusText}`;
        let fieldErrors = '';
        if (errorData.details) {
            fieldErrors = Object.entries(errorData.details).map(([key, value]) => `${key}: ${(value as string[]).join(', ')}`).join('; ');
        }
        setRegistrationError(`${errorMessage}${fieldErrors ? `. Details: ${fieldErrors}`: ''}`);
        toast({ title: 'Registration Failed', description: `${errorMessage}${fieldErrors ? `. Details: ${fieldErrors}`: ''}`, variant: 'destructive' });
        throw new Error(errorMessage);
      }
      
      toast({ title: 'Registration Successful!', description: "Thank you for registering. We've received your details." });
      // e.currentTarget.reset(); // Optionally reset the form
      // router.push('/events'); // Or redirect to a success page or back to events list
    } catch (err) {
      console.error('Registration submission error:', err);
      // Error already set by the !response.ok block or caught here for network errors
      if (!registrationError) { // Avoid double messaging if already set
        setRegistrationError(err instanceof Error ? err.message : 'An unexpected error occurred during registration.');
         toast({ title: 'Registration Error', description: err instanceof Error ? err.message : 'An unexpected error occurred.', variant: 'destructive' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-xl text-foreground/80">Loading event details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h1 className="text-3xl font-bold text-destructive mb-4">Error Loading Event</h1>
        <p className="text-foreground/80 mb-8">{error}</p>
        <Button asChild variant="outline">
          <Link href="/events">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
          </Link>
        </Button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h1 className="text-3xl font-bold text-destructive mb-4">Event Not Found</h1>
        <p className="text-foreground/80 mb-8">The event you are looking for does not exist or may have been moved.</p>
        <Button asChild variant="outline">
          <Link href="/events">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Button asChild variant="outline" size="sm">
          <Link href="/events">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Events
          </Link>
        </Button>
      </div>

      <article>
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-4">{event.title}</h1>
          <div className="flex flex-wrap items-center text-lg text-foreground/80 gap-x-6 gap-y-2 mb-6">
            <div className="flex items-center">
              <CalendarDays className="w-5 h-5 mr-2 text-accent" />
              <span>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {event.time}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-accent" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-accent" />
              <span>Organized by: {event.organizer}</span>
            </div>
          </div>
          <Image
            src={event.image || 'https://placehold.co/1200x600.png'}
            alt={event.altText || event.title}
            width={1200}
            height={600}
            className="rounded-lg shadow-xl object-cover w-full max-h-[500px]"
            data-ai-hint={event.imageHint || 'event detail'}
            priority
          />
        </header>

        <section className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-2 space-y-6 text-foreground/80 text-lg leading-relaxed">
            <h2 className="text-3xl font-headline font-semibold text-primary mb-3">Event Details</h2>
            <div className="prose prose-lg max-w-none text-foreground/80" dangerouslySetInnerHTML={{ __html: event.fullDescription.replace(/\n/g, '<br />') || event.description.replace(/\n/g, '<br />') }} />
          </div>

          <Card className="md:col-span-1 shadow-lg h-fit">
            <CardHeader>
              <CardTitle className="text-2xl font-headline text-primary">Register for this Event</CardTitle>
              <CardDescription className="text-foreground/70">
                Fill in your details to secure your spot.
                {event.maxAttendees && <span className="block text-sm">Limited spots available! ({event.maxAttendees} total)</span>}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" placeholder="e.g., Jane Doe" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" name="email" type="email" placeholder="you@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attendees">Number of Attendees</Label>
                  <Input id="attendees" name="attendees" type="number" defaultValue="1" min="1" max={event.maxAttendees || 10} required />
                </div>
                {registrationError && (
                  <p className="text-sm text-destructive flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" /> {registrationError}
                  </p>
                )}
                <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UserPlus className="mr-2 h-5 w-5" />}
                  {isSubmitting ? 'Registering...' : 'Register Now'}
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-foreground/60">
                Spaces may be limited. Register early to avoid disappointment.
              </p>
            </CardFooter>
          </Card>
        </section>
      </article>
    </div>
  );
}
