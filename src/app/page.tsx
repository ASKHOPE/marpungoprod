
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CalendarDays, DollarSign, HelpingHand, Loader2, AlertTriangle, MapPin, Heart, Zap, CheckCircle } from 'lucide-react'; 
import React, { useEffect, useState } from 'react';
import type { Event as EventType } from '@/types/db';

async function getAllEvents(): Promise<EventType[]> {
  const response = await fetch('/api/events');
  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData && errorData.error) {
        errorMessage = `API Error (${response.status}): ${errorData.error}`;
        if(errorData.details) {
          console.error("Server error details:", errorData.details);
          // errorMessage += ` Details: ${errorData.details.substring(0, 200)}...`; // Stack might be too long for client
        }
      }
    } catch (e) {
      // If response is not JSON, try to get text for more context
      const textResponse = await response.text().catch(() => "Could not retrieve error response text.");
      errorMessage = `API Error: ${response.status} ${response.statusText}. Response was not valid JSON. Preview: ${textResponse.substring(0, 200)}...`;
      console.error("Failed to parse error JSON from /api/events or response was not JSON. Raw response preview:", textResponse.substring(0, 500));
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export default function Home() {
  const [ongoingEvent, setOngoingEvent] = useState<EventType | null>(null);
  const [upcomingEventsList, setUpcomingEventsList] = useState<EventType[]>([]);
  const [pastEventsList, setPastEventsList] = useState<EventType[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  const generalDonationLink = process.env.NEXT_PUBLIC_STRIPE_GENERAL_DONATION_LINK;

  useEffect(() => {
    setIsLoadingEvents(true);
    setEventsError(null);
    console.log("Homepage: Initiating fetch for all events...");
    getAllEvents()
      .then(allFetchedEvents => {
        console.log("Homepage: Successfully fetched events", allFetchedEvents.length);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let foundOngoing: EventType | null = null;
        const futureEvents: EventType[] = [];
        const pastEventsSorted: EventType[] = [];

        allFetchedEvents.forEach(event => {
          const eventDate = new Date(event.date);
          const eventDateNormalized = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());

          if (eventDateNormalized.getTime() === today.getTime()) {
            if (!foundOngoing) { 
              foundOngoing = event;
            } else { 
              futureEvents.push(event);
            }
          } else if (eventDateNormalized > today) {
            futureEvents.push(event);
          } else {
            pastEventsSorted.push(event);
          }
        });

        futureEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        pastEventsSorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        if (foundOngoing) {
            const indexInFuture = futureEvents.findIndex(fe => fe.id === foundOngoing!.id);
            if (indexInFuture > -1) futureEvents.splice(indexInFuture, 1);
        }

        setOngoingEvent(foundOngoing);
        setUpcomingEventsList(futureEvents);
        setPastEventsList(pastEventsSorted);
      })
      .catch(err => {
        console.error("Homepage: Error caught while fetching or processing events:", err);
        if (err instanceof Error) {
          console.error("Error name:", err.name);
          console.error("Error message:", err.message);
          if (err.stack) {
            // console.error("Error stack:", err.stack); // Stack might be too verbose for client console by default
          }
          setEventsError(`Failed to load events: ${err.message}`);
        } else {
          setEventsError('An unknown error occurred while loading events.');
        }
      })
      .finally(() => {
        console.log("Homepage: Finished event fetching attempt.");
        setIsLoadingEvents(false)
      });
  }, []);

  const eventsToDisplay: EventType[] = [];
  if (ongoingEvent) {
    eventsToDisplay.push(ongoingEvent);
    if (upcomingEventsList.length > 0 && eventsToDisplay.length < 2) {
      eventsToDisplay.push(upcomingEventsList[0]);
    }
  } else if (upcomingEventsList.length > 0) {
    eventsToDisplay.push(...upcomingEventsList.slice(0, 2));
  } 
  
  if (eventsToDisplay.length < 2 && pastEventsList.length > 0) {
    const needed = 2 - eventsToDisplay.length;
    eventsToDisplay.push(...pastEventsList.slice(0, needed));
  }


  return (
    <div className="space-y-16">
      <section className="text-center py-16 bg-gradient-to-b from-primary/10 to-background rounded-lg shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-6">
                 <Image
                            src="/logosvg.svg" // Assuming your logo is public/logo.png
                            alt="Marpu NGO Logo"
                            width={75} // Adjust width as needed
                            height={75} // Adjust height as needed
                            className="mr-2"
                          />
          </div>
          <h1 className="text-5xl font-headline font-bold text-primary mb-6">
            Welcome to Marpu NGO
          </h1>
          <p className="text-xl text-foreground/80 mb-8 max-w-2xl mx-auto">
            Your central hub for creating positive impact and fostering community collaboration. Discover local events, find meaningful volunteer opportunities, and learn how you can contribute to a better world for all.
          </p>
          <div className="space-x-4">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/events">Explore Events</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10">
              <Link href="/volunteer">Get Involved</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-headline font-semibold text-primary mb-10 text-center">Our Core Mission</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6 bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <Users className="w-12 h-12 text-accent mx-auto mb-4" />
            <h3 className="text-xl font-headline font-semibold text-primary mb-2">Empower Communities</h3>
            <p className="text-foreground/70">We work to strengthen communities by providing resources, support, and opportunities for growth and collaboration.</p>
          </div>
          <div className="p-6 bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <Zap className="w-12 h-12 text-accent mx-auto mb-4" />
            <h3 className="text-xl font-headline font-semibold text-primary mb-2">Drive Impactful Change</h3>
            <p className="text-foreground/70">We initiate and support projects that create measurable, positive change in people's lives and their environments.</p>
          </div>
          <div className="p-6 bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <Heart className="w-12 h-12 text-accent mx-auto mb-4" />
            <h3 className="text-xl font-headline font-semibold text-primary mb-2">Foster Collaboration</h3>
            <p className="text-foreground/70">We believe in the power of partnership, bringing together individuals, groups, and organizations to achieve shared goals.</p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-headline font-semibold text-primary mb-10 text-center">Events</h2>
        {isLoadingEvents ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-10 h-10 text-primary animate-spin mr-3" />
            <p className="text-lg text-foreground/70">Loading events...</p>
          </div>
        ) : eventsError ? (
          <div className="text-center py-10 text-destructive bg-destructive/10 p-4 rounded-md">
             <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p>{eventsError}</p>
          </div>
        ) : eventsToDisplay.length === 0 ? (
          <p className="text-center text-foreground/70 py-10">No events currently available. Check back soon!</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {eventsToDisplay.map(event => {
                const eventDate = new Date(event.date);
                const today = new Date();
                today.setHours(0,0,0,0);
                const isOngoing = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate()).getTime() === today.getTime();
                const isPast = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate()) < today;

                let statusText = "Upcoming";
                let statusColor = "bg-green-500";
                if (isOngoing) { statusText = "Ongoing Today"; statusColor = "bg-blue-500"; }
                else if (isPast) { statusText = "Past Event"; statusColor = "bg-slate-500"; }

              return (
                <Card key={event.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                  <CardHeader className="p-0 relative">
                    <Image
                      src={event.image || 'https://placehold.co/600x400.png'}
                      alt={event.altText || event.title}
                      width={600}
                      height={400} 
                      className="rounded-t-lg object-cover w-full h-48" 
                      data-ai-hint={event.imageHint || 'event placeholder'}
                    />
                     <div className={`absolute top-2 right-2 px-3 py-1 rounded-md text-xs font-semibold text-white ${statusColor}`}>
                        {statusText}
                     </div>
                  </CardHeader>
                  <CardContent className="flex-grow p-4">
                    <CardTitle className="text-primary font-headline text-xl mb-2 mt-2">{event.title}</CardTitle>
                     <div className="flex items-center text-sm text-foreground/70 mb-1">
                        <CalendarDays className="w-4 h-4 mr-2 text-accent" />
                        <span>{eventDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })} - {event.time}</span>
                      </div>
                      <div className="flex items-center text-sm text-foreground/70 mb-2">
                        <MapPin className="w-4 h-4 mr-2 text-accent" />
                        <span>{event.location}</span>
                      </div>
                    <CardDescription className="text-foreground/70 mb-2 text-sm line-clamp-3">{event.description}</CardDescription>
                  </CardContent>
                  <CardFooter className="p-4 bg-muted/50">
                    <Button asChild variant="link" className="text-accent p-0 text-sm hover:text-accent/80">
                      <Link href={`/events/${event.id}`}>Learn More &rarr;</Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="bg-secondary py-16 rounded-lg shadow-lg">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-headline font-semibold text-primary mb-6">Ready to Make a Difference?</h2>
          <p className="text-lg text-foreground/80 mb-8 max-w-xl mx-auto">
            Your support, whether through donations or volunteering your time, can power crucial projects and community initiatives. Join us today!
          </p>
          <div className="space-x-4">
            {generalDonationLink ? (
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <a href={generalDonationLink} target="_blank" rel="noopener noreferrer">
                  <DollarSign className="mr-2 h-5 w-5" /> Donate Now
                </a>
              </Button>
            ) : (
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled>
                <DollarSign className="mr-2 h-5 w-5" /> Donate Now
              </Button>
            )}
            <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10">
              <Link href="/volunteer"><Users className="mr-2 h-5 w-5" />Volunteer</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
