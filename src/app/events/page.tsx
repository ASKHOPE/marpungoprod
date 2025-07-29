
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { CalendarDays, MapPin, Users, HelpCircle, Loader2, AlertTriangle, PlayCircle, History, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { Event as EventType } from '@/types/db';

const ITEMS_PER_PAGE = 4; // Number of events to show per page for each category (2 for grid, 3 for list)

async function getEvents(): Promise<EventType[]> {
  const response = await fetch('/api/events'); 
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }
  return response.json();
}

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  categoryName: string;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ currentPage, totalPages, onPageChange, categoryName }) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-6 flex items-center justify-center space-x-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label={`Previous page for ${categoryName}`}
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Previous
      </Button>
      <span className="text-sm text-foreground/80">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label={`Next page for ${categoryName}`}
      >
        Next
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
};

export default function EventsPage() {
  const [allEvents, setAllEvents] = useState<EventType[]>([]);
  const [ongoingEvents, setOngoingEvents] = useState<EventType[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<EventType[]>([]);
  const [pastEvents, setPastEvents] = useState<EventType[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPageOngoing, setCurrentPageOngoing] = useState(1);
  const [currentPageUpcoming, setCurrentPageUpcoming] = useState(1);
  const [currentPagePast, setCurrentPagePast] = useState(1);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    getEvents()
      .then(data => {
        setAllEvents(data);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const categorizedOngoing: EventType[] = [];
        const categorizedUpcoming: EventType[] = [];
        const categorizedPast: EventType[] = [];

        data.forEach(event => {
          const eventDate = new Date(event.date);
          const eventDateNormalized = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());

          if (eventDateNormalized.getTime() === today.getTime()) {
            categorizedOngoing.push(event);
          } else if (eventDateNormalized > today) {
            categorizedUpcoming.push(event);
          } else {
            categorizedPast.push(event);
          }
        });
        
        categorizedOngoing.sort((a,b) => a.time.localeCompare(b.time) || a.title.localeCompare(b.title));
        categorizedUpcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        categorizedPast.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setOngoingEvents(categorizedOngoing);
        setUpcomingEvents(categorizedUpcoming);
        setPastEvents(categorizedPast);
      })
      .catch(err => {
        console.error("Failed to fetch events data:", err);
        setError('Failed to load events. Please try again later.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const renderEventCard = (event: EventType, status: 'ongoing' | 'upcoming' | 'past') => {
    let statusText = "Upcoming";
    let statusColor = "bg-green-500/80 hover:bg-green-600/90";
    let StatusIcon = CheckCircle;

    if (status === 'ongoing') {
      statusText = "Ongoing Today";
      statusColor = "bg-blue-500 hover:bg-blue-600";
      StatusIcon = PlayCircle;
    } else if (status === 'past') {
      statusText = "Past Event";
      statusColor = "bg-slate-500 hover:bg-slate-600";
      StatusIcon = History;
    }

    return (
      <Card key={event.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 w-full">
        <CardHeader className="p-0 relative">
          <Image
            src={event.image || 'https://placehold.co/600x400.png'}
            alt={event.altText || event.title}
            width={600}
            height={300} // Adjusted height for better fit in grid and list
            className="object-cover w-full h-56" // Consistent height
            data-ai-hint={event.imageHint || 'event placeholder'}
          />
          <div className={`absolute top-2 right-2 px-3 py-1 rounded-md text-xs font-semibold text-white ${statusColor} flex items-center`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusText}
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-6 space-y-3">
          <CardTitle className="text-2xl font-headline text-primary">{event.title}</CardTitle>
          <div className="flex items-center text-sm text-foreground/70">
            <CalendarDays className="w-4 h-4 mr-2 text-accent" />
            <span>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {event.time}</span>
          </div>
          <div className="flex items-center text-sm text-foreground/70">
            <MapPin className="w-4 h-4 mr-2 text-accent" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center text-sm text-foreground/70">
            <Users className="w-4 h-4 mr-2 text-accent" />
            <span>Organized by: {event.organizer}</span>
          </div>
          <CardDescription className="text-foreground/70 pt-2 text-base line-clamp-3">{event.description}</CardDescription>
        </CardContent>
        <CardFooter className="p-6 bg-secondary/30">
          <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground md:w-auto">
            <Link href={`/events/${event.id}`}>Learn More & Register</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const getPaginatedEvents = (events: EventType[], currentPage: number) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return events.slice(startIndex, endIndex);
  };

  const paginatedOngoingEvents = getPaginatedEvents(ongoingEvents, currentPageOngoing);
  const paginatedUpcomingEvents = getPaginatedEvents(upcomingEvents, currentPageUpcoming);
  const paginatedPastEvents = getPaginatedEvents(pastEvents, currentPagePast);

  // Adjust ITEMS_PER_PAGE for grid view if needed, for now, it's global
  const totalPagesOngoing = Math.ceil(ongoingEvents.length / ITEMS_PER_PAGE);
  const totalPagesUpcoming = Math.ceil(upcomingEvents.length / ITEMS_PER_PAGE);
  const totalPagesPast = Math.ceil(pastEvents.length / ITEMS_PER_PAGE);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-xl text-foreground/80">Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h1 className="text-3xl font-bold text-destructive mb-4">Error Loading Events</h1>
        <p className="text-foreground/80 mb-8">{error}</p>
      </div>
    );
  }

  const noEventsAvailable = !ongoingEvents.length && !upcomingEvents.length && !pastEvents.length;

  return (
    <div className="container mx-auto px-4 py-12">
      <section className="text-center mb-12">
        <CalendarDays size={48} className="text-primary mx-auto mb-4" />
        <h1 className="text-5xl font-headline font-bold text-primary mb-4">Our Events</h1>
        <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
          Discover exciting opportunities to get involved, learn new skills, and contribute directly to our shared environmental goals. Your participation makes a difference!
        </p>
      </section>

      {noEventsAvailable ? (
        <section className="text-center py-10">
          <p className="text-xl text-foreground/70">No events currently scheduled. Please check back soon!</p>
        </section>
      ) : (
        <>
          {ongoingEvents.length > 0 && (
            <section className="mb-16">
              <h2 className="text-3xl font-headline font-semibold text-primary mb-8 text-center">Ongoing Events Today</h2>
              <div className="space-y-8 max-w-3xl mx-auto"> {/* Single column list */}
                {paginatedOngoingEvents.map(event => renderEventCard(event, 'ongoing'))}
              </div>
              <PaginationControls
                currentPage={currentPageOngoing}
                totalPages={totalPagesOngoing}
                onPageChange={setCurrentPageOngoing}
                categoryName="Ongoing Events"
              />
            </section>
          )}

          {upcomingEvents.length > 0 && (
            <section className="mb-16">
              <h2 className="text-3xl font-headline font-semibold text-primary mb-8 text-center">Upcoming Events</h2>
              <div className="grid md:grid-cols-2 gap-8"> {/* 2-column grid for upcoming */}
                {paginatedUpcomingEvents.map(event => renderEventCard(event, 'upcoming'))}
              </div>
               <PaginationControls
                currentPage={currentPageUpcoming}
                totalPages={totalPagesUpcoming}
                onPageChange={setCurrentPageUpcoming}
                categoryName="Upcoming Events"
              />
            </section>
          )}
          
          {pastEvents.length > 0 && (
            <section className="mb-12">
              <h2 className="text-3xl font-headline font-semibold text-primary mb-8 text-center">Past Events</h2>
              <div className="grid md:grid-cols-2 gap-8"> {/* 2-column grid for past */}
                {paginatedPastEvents.map(event => renderEventCard(event, 'past'))}
              </div>
              <PaginationControls
                currentPage={currentPagePast}
                totalPages={totalPagesPast}
                onPageChange={setCurrentPagePast}
                categoryName="Past Events"
              />
            </section>
          )}
        </>
      )}

      <section className="mt-16 text-center py-10 bg-primary/10 rounded-lg shadow-md">
        <HelpCircle size={32} className="text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-headline font-semibold text-primary mb-4">Host Your Own Eco-Event!</h2>
        <p className="text-foreground/80 mb-6 max-w-lg mx-auto">
          Have a brilliant idea for an environmental initiative or educational event in your community? We can provide support, resources, and help you get started. Let&apos;s collaborate for a greener tomorrow!
        </p>
        <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/5">
          <Link href="/contact?subject=Event%20Partnership%20Inquiry">Partner With Us</Link>
        </Button>
      </section>
    </div>
  );
}
